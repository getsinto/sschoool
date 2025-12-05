/**
 * Enhanced Pricing & Enrollment Type Definitions
 * Version: 1.0.0
 * Date: January 8, 2025
 */

// ============================================================================
// PRICING MODELS
// ============================================================================

export type PricingModel = 
  | 'free'
  | 'one_time'
  | 'subscription'
  | 'tiered'
  | 'pay_what_you_want'
  | 'bulk'
  | 'early_bird'
  | 'free_trial'

export type SubscriptionType = 'monthly' | 'quarterly' | 'yearly'

export type PaymentPlanFrequency = 'weekly' | 'biweekly' | 'monthly'

export type AccessDurationType = 
  | 'lifetime'
  | 'time_limited'
  | 'batch_duration'
  | 'subscription_based'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED'

// ============================================================================
// PRICING TIER
// ============================================================================

export interface PricingTier {
  id: string
  name: string
  description?: string
  price: number
  features: string[]
  isPopular?: boolean
  maxStudents?: number
  accessLevel?: 'basic' | 'standard' | 'premium' | 'vip'
}

// ============================================================================
// COURSE PRICING CONFIGURATION
// ============================================================================

export interface CoursePricingConfig {
  // Basic pricing
  pricing_model: PricingModel
  price: number
  currency: Currency
  
  // Subscription
  subscription_type?: SubscriptionType
  subscription_price?: number
  auto_renewal?: boolean
  
  // Payment plans
  payment_plan_enabled?: boolean
  payment_plan_installments?: number
  payment_plan_frequency?: PaymentPlanFrequency
  payment_plan_down_payment?: number
  
  // Early bird
  early_bird_enabled?: boolean
  early_bird_price?: number
  early_bird_deadline?: string
  regular_price?: number
  
  // Enrollment limits
  min_students?: number
  max_students?: number
  current_enrollments?: number
  enable_waitlist?: boolean
  
  // Access duration
  access_duration_type?: AccessDurationType
  access_duration_days?: number
  
  // Batch-based
  is_batch_based?: boolean
  
  // Pay what you want
  min_price?: number
  suggested_price?: number
  
  // Free trial
  free_trial_enabled?: boolean
  free_trial_days?: number
  trial_requires_card?: boolean
  
  // Tiered pricing
  pricing_tiers?: PricingTier[]
  
  // Bundle
  bundle_id?: string
}

// ============================================================================
// COURSE BATCH
// ============================================================================

export type BatchStatus = 
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface CourseBatch {
  id: string
  course_id: string
  
  // Batch info
  batch_name: string
  batch_number?: number
  batch_description?: string
  
  // Schedule
  start_date: string
  end_date: string
  registration_opens: string
  registration_closes: string
  
  // Class schedule
  schedule_days: string[] // ['monday', 'wednesday', 'friday']
  schedule_time?: string // '18:00'
  timezone: string
  
  // Enrollment
  max_students?: number
  min_students?: number
  current_enrollments: number
  spots_remaining?: number
  
  // Status
  status: BatchStatus
  
  // Pricing
  batch_price?: number
  
  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CourseBatchInsert {
  course_id: string
  batch_name: string
  batch_number?: number
  batch_description?: string
  start_date: string
  end_date: string
  registration_opens: string
  registration_closes: string
  schedule_days?: string[]
  schedule_time?: string
  timezone?: string
  max_students?: number
  min_students?: number
  batch_price?: number
  created_by?: string
}

export interface CourseBatchUpdate {
  batch_name?: string
  batch_description?: string
  start_date?: string
  end_date?: string
  registration_opens?: string
  registration_closes?: string
  schedule_days?: string[]
  schedule_time?: string
  timezone?: string
  max_students?: number
  min_students?: number
  batch_price?: number
  status?: BatchStatus
}

// ============================================================================
// COURSE BUNDLE
// ============================================================================

export interface CourseBundle {
  id: string
  
  // Bundle info
  bundle_name: string
  bundle_slug: string
  bundle_description?: string
  
  // Pricing
  bundle_price: number
  regular_price?: number
  savings_amount?: number
  savings_percentage?: number
  currency: Currency
  
  // Courses
  course_ids: string[]
  
  // Access
  validity_days?: number
  
  // Visibility
  is_active: boolean
  is_featured: boolean
  
  // Metadata
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CourseBundleInsert {
  bundle_name: string
  bundle_slug: string
  bundle_description?: string
  bundle_price: number
  regular_price?: number
  currency?: Currency
  course_ids: string[]
  validity_days?: number
  is_active?: boolean
  is_featured?: boolean
  created_by?: string
}

export interface CourseBundleUpdate {
  bundle_name?: string
  bundle_slug?: string
  bundle_description?: string
  bundle_price?: number
  regular_price?: number
  course_ids?: string[]
  validity_days?: number
  is_active?: boolean
  is_featured?: boolean
}

export interface CourseBundleWithCourses extends CourseBundle {
  courses?: Array<{
    id: string
    title: string
    thumbnail_url?: string
    price: number
  }>
}

// ============================================================================
// WAITLIST
// ============================================================================

export type WaitlistStatus = 
  | 'waiting'
  | 'notified'
  | 'enrolled'
  | 'expired'
  | 'cancelled'

export interface CourseWaitlist {
  id: string
  
  // References
  course_id: string
  batch_id?: string
  student_id: string
  
  // Waitlist info
  joined_waitlist_at: string
  position?: number
  priority: number
  
  // Notification
  notified: boolean
  notified_at?: string
  notification_expires_at?: string
  
  // Status
  status: WaitlistStatus
  
  // Metadata
  notes?: string
  created_at: string
  updated_at: string
}

export interface CourseWaitlistInsert {
  course_id: string
  batch_id?: string
  student_id: string
  priority?: number
  notes?: string
}

export interface WaitlistWithDetails extends CourseWaitlist {
  course?: {
    title: string
    thumbnail_url?: string
  }
  batch?: {
    batch_name: string
    start_date: string
  }
  student?: {
    full_name: string
    email: string
  }
}

// ============================================================================
// PAYMENT PLAN
// ============================================================================

export type PaymentPlanStatus = 
  | 'active'
  | 'completed'
  | 'defaulted'
  | 'cancelled'

export interface PaymentPlan {
  id: string
  
  // References
  enrollment_id: string
  student_id: string
  course_id: string
  
  // Plan details
  total_amount: number
  down_payment: number
  remaining_amount: number
  installment_amount: number
  num_installments: number
  installments_paid: number
  
  // Schedule
  frequency: PaymentPlanFrequency
  next_payment_date?: string
  
  // Status
  status: PaymentPlanStatus
  
  // Metadata
  created_at: string
  updated_at: string
}

export interface PaymentPlanInsert {
  enrollment_id: string
  student_id: string
  course_id: string
  total_amount: number
  down_payment?: number
  remaining_amount: number
  installment_amount: number
  num_installments: number
  frequency: PaymentPlanFrequency
  next_payment_date?: string
}

export interface PaymentPlanWithDetails extends PaymentPlan {
  course?: {
    title: string
  }
  student?: {
    full_name: string
    email: string
  }
  installments?: InstallmentPayment[]
}

// ============================================================================
// INSTALLMENT PAYMENT
// ============================================================================

export type InstallmentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'waived'

export interface InstallmentPayment {
  id: string
  
  // References
  payment_plan_id: string
  student_id: string
  
  // Payment details
  installment_number: number
  amount: number
  due_date: string
  paid_date?: string
  
  // Payment info
  payment_method?: string
  transaction_id?: string
  stripe_payment_intent_id?: string
  
  // Status
  status: InstallmentStatus
  
  // Metadata
  notes?: string
  created_at: string
  updated_at: string
}

export interface InstallmentPaymentInsert {
  payment_plan_id: string
  student_id: string
  installment_number: number
  amount: number
  due_date: string
  status?: InstallmentStatus
}

// ============================================================================
// BUNDLE ENROLLMENT
// ============================================================================

export type BundleEnrollmentStatus = 
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'refunded'

export interface BundleEnrollment {
  id: string
  
  // References
  bundle_id: string
  student_id: string
  
  // Enrollment details
  enrolled_at: string
  expires_at?: string
  
  // Payment
  amount_paid: number
  payment_method?: string
  transaction_id?: string
  
  // Status
  status: BundleEnrollmentStatus
  
  // Metadata
  created_at: string
  updated_at: string
}

export interface BundleEnrollmentInsert {
  bundle_id: string
  student_id: string
  amount_paid: number
  payment_method?: string
  transaction_id?: string
  expires_at?: string
}

export interface BundleEnrollmentWithDetails extends BundleEnrollment {
  bundle?: CourseBundleWithCourses
  student?: {
    full_name: string
    email: string
  }
}

// ============================================================================
// ENHANCED ENROLLMENT
// ============================================================================

export interface EnhancedEnrollment {
  id: string
  student_id: string
  course_id: string
  
  // Batch & Bundle
  batch_id?: string
  bundle_id?: string
  
  // Pricing
  pricing_tier?: string
  amount_paid?: number
  original_price?: number
  discount_applied?: number
  
  // Access
  access_expires_at?: string
  
  // Trial
  is_trial: boolean
  trial_ends_at?: string
  trial_converted: boolean
  
  // Payment plan
  payment_plan_id?: string
  
  // Subscription
  subscription_id?: string
  subscription_status?: 'active' | 'past_due' | 'cancelled' | 'paused'
  
  // Status
  status: string
  enrolled_at: string
  completed_at?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

// ============================================================================
// PRICING DISPLAY
// ============================================================================

export interface PricingDisplay {
  model: PricingModel
  currentPrice: number
  originalPrice?: number
  discount?: number
  discountPercentage?: number
  currency: Currency
  
  // Early bird
  isEarlyBird?: boolean
  earlyBirdDeadline?: string
  earlyBirdSavings?: number
  
  // Subscription
  subscriptionType?: SubscriptionType
  subscriptionPrice?: number
  
  // Payment plan
  hasPaymentPlan?: boolean
  installmentAmount?: number
  numInstallments?: number
  
  // Free trial
  hasFreeTrial?: boolean
  trialDays?: number
  
  // Enrollment
  spotsRemaining?: number
  isWaitlistAvailable?: boolean
  enrollmentDeadline?: string
  
  // Tiers
  tiers?: PricingTier[]
}

// ============================================================================
// PRICING CALCULATOR
// ============================================================================

export interface PricingCalculation {
  basePrice: number
  discounts: Array<{
    type: string
    amount: number
    description: string
  }>
  totalDiscount: number
  finalPrice: number
  savings: number
  savingsPercentage: number
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface PricingFormData {
  pricing_model: PricingModel
  price: number
  currency: Currency
  
  // Subscription
  subscription_type?: SubscriptionType
  subscription_price?: number
  auto_renewal?: boolean
  
  // Payment plan
  payment_plan_enabled?: boolean
  payment_plan_installments?: number
  payment_plan_frequency?: PaymentPlanFrequency
  payment_plan_down_payment?: number
  
  // Early bird
  early_bird_enabled?: boolean
  early_bird_price?: number
  early_bird_deadline?: string
  regular_price?: number
  
  // Enrollment
  min_students?: number
  max_students?: number
  enable_waitlist?: boolean
  
  // Access
  access_duration_type?: AccessDurationType
  access_duration_days?: number
  
  // Batch
  is_batch_based?: boolean
  
  // Pay what you want
  min_price?: number
  suggested_price?: number
  
  // Free trial
  free_trial_enabled?: boolean
  free_trial_days?: number
  trial_requires_card?: boolean
  
  // Tiered
  pricing_tiers?: PricingTier[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PRICING_MODELS: Array<{
  value: PricingModel
  label: string
  description: string
}> = [
  {
    value: 'free',
    label: 'Free',
    description: 'Course is completely free for all students'
  },
  {
    value: 'one_time',
    label: 'One-time Payment',
    description: 'Students pay once for lifetime access'
  },
  {
    value: 'subscription',
    label: 'Subscription',
    description: 'Recurring payments (monthly, quarterly, yearly)'
  },
  {
    value: 'tiered',
    label: 'Tiered Pricing',
    description: 'Multiple pricing tiers with different features'
  },
  {
    value: 'pay_what_you_want',
    label: 'Pay What You Want',
    description: 'Students choose their own price (with minimum)'
  },
  {
    value: 'early_bird',
    label: 'Early Bird',
    description: 'Discounted price before deadline'
  },
  {
    value: 'free_trial',
    label: 'Free Trial',
    description: 'Free trial period before payment'
  },
  {
    value: 'bulk',
    label: 'Bulk/Group',
    description: 'Discounts for group enrollments'
  }
]

export const SUBSCRIPTION_TYPES: Array<{
  value: SubscriptionType
  label: string
  description: string
}> = [
  { value: 'monthly', label: 'Monthly', description: 'Billed every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Billed every 3 months' },
  { value: 'yearly', label: 'Yearly', description: 'Billed annually' }
]

export const PAYMENT_FREQUENCIES: Array<{
  value: PaymentPlanFrequency
  label: string
}> = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'monthly', label: 'Monthly' }
]

export const ACCESS_DURATION_TYPES: Array<{
  value: AccessDurationType
  label: string
  description: string
}> = [
  {
    value: 'lifetime',
    label: 'Lifetime Access',
    description: 'Students have permanent access'
  },
  {
    value: 'time_limited',
    label: 'Time Limited',
    description: 'Access expires after specified days'
  },
  {
    value: 'batch_duration',
    label: 'Batch Duration',
    description: 'Access limited to batch period'
  },
  {
    value: 'subscription_based',
    label: 'Subscription Based',
    description: 'Access while subscription is active'
  }
]

export const CURRENCIES: Array<{
  value: Currency
  label: string
  symbol: string
}> = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCurrencySymbol(currency: Currency): string {
  const curr = CURRENCIES.find(c => c.value === currency)
  return curr?.symbol || '$'
}

export function formatPrice(amount: number, currency: Currency = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toFixed(2)}`
}

export function calculateSavings(originalPrice: number, discountedPrice: number): {
  amount: number
  percentage: number
} {
  const amount = originalPrice - discountedPrice
  const percentage = (amount / originalPrice) * 100
  return {
    amount: Math.max(0, amount),
    percentage: Math.max(0, Math.round(percentage))
  }
}

export function isEarlyBirdActive(deadline?: string): boolean {
  if (!deadline) return false
  return new Date(deadline) > new Date()
}

export function hasAvailableSpots(
  maxStudents?: number,
  currentEnrollments?: number
): boolean {
  if (!maxStudents) return true
  return (currentEnrollments || 0) < maxStudents
}

export function calculateInstallmentAmount(
  totalAmount: number,
  downPayment: number,
  numInstallments: number
): number {
  const remaining = totalAmount - downPayment
  return remaining / numInstallments
}
