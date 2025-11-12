interface PayPalConfig {
  clientId: string
  clientSecret: string
  environment: 'sandbox' | 'production'
}

interface CreateOrderParams {
  amount: string
  currency: string
  courseId: string
  userId: string
  couponCode?: string
  returnUrl: string
  cancelUrl: string
}

interface CaptureOrderParams {
  orderId: string
}

interface RefundParams {
  captureId: string
  amount?: string
  currency?: string
  reason?: string
}

class PayPalService {
  private config: PayPalConfig
  private baseUrl: string

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    }
    
    this.baseUrl = this.config.environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async createOrder(params: CreateOrderParams) {
    try {
      const accessToken = await this.getAccessToken()
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
          custom_id: JSON.stringify({
            courseId: params.courseId,
            userId: params.userId,
            couponCode: params.couponCode,
          }),
        }],
        application_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`PayPal order creation failed: ${error.message}`)
      }

      const order = await response.json()
      
      return {
        success: true,
        orderId: order.id,
        approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
        order,
      }
    } catch (error) {
      console.error('PayPal order creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async captureOrder(params: CaptureOrderParams) {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${params.orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`PayPal capture failed: ${error.message}`)
      }

      const capture = await response.json()
      
      return {
        success: capture.status === 'COMPLETED',
        status: capture.status,
        captureId: capture.purchase_units[0]?.payments?.captures[0]?.id,
        capture,
      }
    } catch (error) {
      console.error('PayPal capture failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async processRefund(params: RefundParams) {
    try {
      const accessToken = await this.getAccessToken()
      
      const refundData: any = {}
      
      if (params.amount && params.currency) {
        refundData.amount = {
          value: params.amount,
          currency_code: params.currency,
        }
      }

      if (params.reason) {
        refundData.note_to_payer = params.reason
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${params.captureId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`PayPal refund failed: ${error.message}`)
      }

      const refund = await response.json()
      
      return {
        success: refund.status === 'COMPLETED',
        refund,
      }
    } catch (error) {
      console.error('PayPal refund failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async verifyWebhookSignature(headers: Record<string, string>, body: string, webhookId: string) {
    try {
      const accessToken = await this.getAccessToken()
      
      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      })

      if (!response.ok) {
        throw new Error('PayPal webhook verification failed')
      }

      const result = await response.json()
      
      return {
        success: result.verification_status === 'SUCCESS',
        event: JSON.parse(body),
      }
    } catch (error) {
      console.error('PayPal webhook verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const paypalService = new PayPalService()
export default paypalService
