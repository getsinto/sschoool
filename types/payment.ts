// Shared payment types

export type PaymentMethod = 'stripe' | 'paypal' | 'razorpay'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'unpaid'
  | 'incomplete'

export interface Payment {
  id: string
  userId: string
  courseId: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentIntentId: string
  status: PaymentStatus
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  courseId: string
  subscriptionId: string
  paymentMethod: PaymentMethod
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: string
  code: string
  discountPercentage?: number
  discountAmount?: number
  validFrom: Date
  validUntil: Date
  maxUses: number
  timesUsed: number
  active: boolean
  createdAt: Date
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  reason?: string
  refundId: string
  status: 'pending' | 'succeeded' | 'failed'
  createdAt: Date
}

export interface Invoice {
  id: string
  paymentId: string
  userId: string
  invoiceNumber: string
  amount: number
  currency: string
  items: InvoiceItem[]
  pdfUrl?: string
  createdAt: Date
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface PaymentHistory {
  payments: Payment[]
  total: number
  page: number
  pageSize: number
}

export interface CreatePaymentParams {
  courseId: string
  userId: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  couponCode?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  clientSecret?: string
  approvalUrl?: string
  error?: string
}
