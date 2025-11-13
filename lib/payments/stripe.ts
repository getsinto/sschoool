import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
// During build time, this might not be set, so we handle it gracefully
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

let stripe: Stripe | null = null

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  })
}

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
    if (!stripe) {
      throw new Error('Stripe is not initialized. Please set STRIPE_SECRET_KEY environment variable.')
    }
    return stripe
  }

  async createPaymentIntent(params: CreatePaymentIntentParams) {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      }
    }

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
