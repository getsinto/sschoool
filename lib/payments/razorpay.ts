import crypto from 'crypto'

interface RazorpayConfig {
  keyId: string
  keySecret: string
}

interface CreateOrderParams {
  amount: number
  currency: string
  courseId: string
  userId: string
  couponCode?: string
  notes?: Record<string, string>
}

interface VerifyPaymentParams {
  orderId: string
  paymentId: string
  signature: string
}

interface RefundParams {
  paymentId: string
  amount?: number
  notes?: Record<string, string>
}

class RazorpayService {
  private config: RazorpayConfig
  private baseUrl: string

  constructor() {
    this.config = {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    }
    
    this.baseUrl = 'https://api.razorpay.com/v1'
  }

  private getAuthHeader(): string {
    const auth = Buffer.from(`${this.config.keyId}:${this.config.keySecret}`).toString('base64')
    return `Basic ${auth}`
  }

  async createOrder(params: CreateOrderParams) {
    try {
      const orderData = {
        amount: params.amount,
        currency: params.currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          courseId: params.courseId,
          userId: params.userId,
          couponCode: params.couponCode || '',
          ...params.notes,
        },
      }

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Razorpay order creation failed: ${error.error?.description}`)
      }

      const order = await response.json()
      
      return {
        success: true,
        orderId: order.id,
        order,
      }
    } catch (error) {
      console.error('Razorpay order creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    try {
      const body = `${params.orderId}|${params.paymentId}`
      const expectedSignature = crypto
        .createHmac('sha256', this.config.keySecret)
        .update(body)
        .digest('hex')

      return expectedSignature === params.signature
    } catch (error) {
      console.error('Razorpay signature verification failed:', error)
      return false
    }
  }

  async processRefund(params: RefundParams) {
    try {
      const refundData: any = {
        notes: params.notes || {},
      }

      if (params.amount) {
        refundData.amount = params.amount
      }

      const response = await fetch(`${this.baseUrl}/payments/${params.paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Razorpay refund failed: ${error.error?.description}`)
      }

      const refund = await response.json()
      
      return {
        success: true,
        refund,
      }
    } catch (error) {
      console.error('Razorpay refund failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      return expectedSignature === signature
    } catch (error) {
      console.error('Razorpay webhook verification failed:', error)
      return false
    }
  }

  async createSubscription(planId: string, customerId: string, totalCount?: number) {
    try {
      const subscriptionData: any = {
        plan_id: planId,
        customer_notify: 1,
        total_count: totalCount || 12,
      }

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Razorpay subscription creation failed: ${error.error?.description}`)
      }

      const subscription = await response.json()
      
      return {
        success: true,
        subscription,
      }
    } catch (error) {
      console.error('Razorpay subscription creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Razorpay subscription cancellation failed: ${error.error?.description}`)
      }

      const subscription = await response.json()
      
      return {
        success: true,
        subscription,
      }
    } catch (error) {
      console.error('Razorpay subscription cancellation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const razorpayService = new RazorpayService()
export default razorpayService
