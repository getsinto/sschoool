import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  courseId: string
  userId: string
  couponCode?: string
  metadata?: Record<string, string>
}

export interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  courseId: string
  userId: string
  couponCode?: string
}

export interface RefundParams {
  paymentIntentId: string
  amount?: number
  reason?: string
}

class StripeService {
  getStripe() {
    return stripe
  }

  async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        metadata: {
          courseId: params.courseId,
          userId: params.userId,
          couponCode: params.couponCode || '',
          ...params.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentIntent,
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      })

      return {
        success: true,
        customer,
      }
    } catch (error) {
      console.error('Stripe customer creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async createSubscription(params: CreateSubscriptionParams) {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: {
          courseId: params.courseId,
          userId: params.userId,
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      }

      if (params.couponCode) {
        subscriptionData.coupon = params.couponCode
      }

      const subscription = await stripe.subscriptions.create(subscriptionData)

      return {
        success: true,
        subscription,
        clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent as any,
      }
    } catch (error) {
      console.error('Stripe subscription creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId)
      
      return {
        success: true,
        subscription,
      }
    } catch (error) {
      console.error('Stripe subscription cancellation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async processRefund(params: RefundParams) {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
      }

      if (params.amount) {
        refundData.amount = params.amount
      }

      if (params.reason) {
        refundData.reason = params.reason as Stripe.RefundCreateParams.Reason
      }

      const refund = await stripe.refunds.create(refundData)

      return {
        success: true,
        refund,
      }
    } catch (error) {
      console.error('Stripe refund failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      return {
        success: true,
        paymentIntent,
      }
    } catch (error) {
      console.error('Stripe payment intent retrieval failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret)
      return { success: true, event }
    } catch (error) {
      console.error('Stripe webhook verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid signature',
      }
    }
  }
}

export const stripeService = new StripeService()
export default stripeService
