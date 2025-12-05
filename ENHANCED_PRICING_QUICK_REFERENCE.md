# Enhanced Pricing System - Quick Reference Guide

**Version**: 1.0.0  
**Last Updated**: January 8, 2025  
**Status**: 80% Complete

---

## 🚀 Quick Start

### For Teachers
```typescript
// 1. Configure pricing for a course
PATCH /api/teacher/courses/[id]/pricing
{
  pricing_model: 'subscription',
  subscription_type: 'monthly',
  subscription_price: 29.99,
  currency: 'USD',
  free_trial_enabled: true,
  free_trial_days: 7
}

// 2. Create a batch
POST /api/teacher/courses/[id]/batches
{
  batch_name: 'Q1 2025 Cohort',
  start_date: '2025-01-15',
  end_date: '2025-07-15',
  registration_opens: '2024-12-01',
  registration_closes: '2025-01-10',
  max_students: 50
}
```

### For Students
```typescript
// 1. Start free trial
POST /api/payments/trial
{
  courseId: 'course-uuid',
  trialDays: 7,
  requiresCard: false
}

// 2. Subscribe to course
POST /api/payments/subscription
{
  courseId: 'course-uuid',
  subscriptionType: 'monthly',
  subscriptionPrice: 29.99,
  currency: 'USD',
  autoRenewal: true
}

// 3. Create payment plan
POST /api/payments/installment
{
  action: 'create_plan',
  courseId: 'course-uuid',
  totalAmount: 299,
  currency: 'USD',
  numInstallments: 3,
  frequency: 'monthly',
  downPayment: 100
}
```

### For Admins
```typescript
// Create course bundle
POST /api/admin/bundles
{
  bundle_name: 'Complete Programming Package',
  bundle_price: 249,
  regular_price: 347,
  course_ids: ['uuid1', 'uuid2', 'uuid3'],
  currency: 'USD',
  is_featured: true
}
```

---

## 📋 Pricing Models

### 1. Free Course
```typescript
{
  pricing_model: 'free',
  price: 0
}
```

### 2. One-time Payment
```typescript
{
  pricing_model: 'one_time',
  price: 299,
  currency: 'USD',
  payment_plan_enabled: true,
  payment_plan_installments: 3,
  payment_plan_frequency: 'monthly'
}
```

### 3. Subscription
```typescript
{
  pricing_model: 'subscription',
  subscription_type: 'monthly', // or 'quarterly', 'yearly'
  subscription_price: 29.99,
  currency: 'USD',
  auto_renewal: true,
  free_trial_enabled: true,
  free_trial_days: 7
}
```

### 4. Tiered Pricing
```typescript
{
  pricing_model: 'tiered',
  pricing_tiers: [
    {
      name: 'Basic',
      price: 99,
      features: ['Feature 1', 'Feature 2']
    },
    {
      name: 'Premium',
      price: 199,
      features: ['All Basic', 'Feature 3', 'Feature 4']
    }
  ]
}
```

### 5. Pay What You Want
```typescript
{
  pricing_model: 'pay_what_you_want',
  min_price: 10,
  suggested_price: 50,
  currency: 'USD'
}
```

### 6. Early Bird
```typescript
{
  pricing_model: 'early_bird',
  early_bird_price: 199,
  regular_price: 299,
  early_bird_deadline: '2025-02-15T00:00:00Z',
  currency: 'USD'
}
```

### 7. Free Trial
```typescript
{
  pricing_model: 'free_trial',
  free_trial_days: 7,
  trial_requires_card: true,
  subscription_price: 29.99,
  subscription_type: 'monthly',
  currency: 'USD'
}
```

### 8. Bulk/Group (Batch-based)
```typescript
{
  pricing_model: 'bulk',
  is_batch_based: true,
  price: 299,
  currency: 'USD',
  max_students: 50
}
```

---

## 🔌 API Endpoints

### Pricing Management
```
PATCH /api/teacher/courses/[id]/pricing
GET   /api/courses/slug/[slug]
```

### Batch Management
```
GET    /api/teacher/courses/[id]/batches
POST   /api/teacher/courses/[id]/batches
GET    /api/teacher/courses/[id]/batches/[batchId]
PATCH  /api/teacher/courses/[id]/batches/[batchId]
DELETE /api/teacher/courses/[id]/batches/[batchId]
```

### Bundle Management
```
GET    /api/admin/bundles
POST   /api/admin/bundles
GET    /api/admin/bundles/[id]
PATCH  /api/admin/bundles/[id]
DELETE /api/admin/bundles/[id]
```

### Waitlist
```
GET    /api/student/courses/[id]/waitlist
POST   /api/student/courses/[id]/waitlist
DELETE /api/student/courses/[id]/waitlist
```

### Payments - Subscription
```
POST   /api/payments/subscription
GET    /api/payments/subscription?subscriptionId=xxx
DELETE /api/payments/subscription?subscriptionId=xxx&enrollmentId=xxx
```

### Payments - Installment
```
POST   /api/payments/installment
GET    /api/payments/installment?type=upcoming|overdue
DELETE /api/payments/installment?paymentPlanId=xxx
```

### Payments - Trial
```
POST   /api/payments/trial
GET    /api/payments/trial
DELETE /api/payments/trial?enrollmentId=xxx
PATCH  /api/payments/trial?enrollmentId=xxx
```

### Webhooks
```
POST   /api/webhooks/stripe
```

---

## 💾 Database Tables

### course_batches
```sql
id, course_id, batch_name, batch_number,
start_date, end_date, registration_opens, registration_closes,
schedule_days, schedule_time, timezone,
max_students, min_students, current_enrollments,
status, created_at, updated_at
```

### course_bundles
```sql
id, bundle_name, bundle_slug, bundle_description,
bundle_price, regular_price, savings_amount, savings_percentage,
currency, course_ids, validity_days,
is_active, is_featured, created_by, created_at, updated_at
```

### course_waitlist
```sql
id, course_id, batch_id, student_id,
joined_waitlist_at, position, priority,
notified, notified_at, notification_expires_at,
status, notes, created_at, updated_at
```

### payment_plans
```sql
id, enrollment_id, student_id, course_id,
total_amount, down_payment, remaining_amount,
installment_amount, num_installments, installments_paid,
frequency, next_payment_date, status,
created_at, updated_at
```

### installment_payments
```sql
id, payment_plan_id, student_id,
installment_number, amount, due_date, paid_date,
payment_method, transaction_id, stripe_payment_intent_id,
status, notes, created_at, updated_at
```

### bundle_enrollments
```sql
id, bundle_id, student_id,
enrolled_at, expires_at,
amount_paid, payment_method, transaction_id,
status, created_at, updated_at
```

---

## 🔐 Authentication & Authorization

### Required Headers
```typescript
Authorization: Bearer <jwt_token>
```

### Role Checks
- **Teacher**: Can manage own courses, batches, pricing
- **Admin**: Can manage all courses, bundles, waitlists
- **Student**: Can enroll, join waitlist, manage payments

---

## 🎨 UI Components

### Teacher Components
```typescript
import EnhancedPricingForm from '@/components/teacher/course-builder/EnhancedPricingForm'
import BatchManager from '@/components/teacher/course-builder/BatchManager'
import BatchForm from '@/components/teacher/course-builder/BatchForm'
```

### Admin Components
```typescript
import BundleCreator from '@/components/admin/bundles/BundleCreator'
import BundleList from '@/components/admin/bundles/BundleList'
```

### Public Components
```typescript
import PricingDisplay from '@/components/public/course/PricingDisplay'
import BatchSelector from '@/components/public/course/BatchSelector'
import EnrollmentStatus from '@/components/public/course/EnrollmentStatus'
```

---

## 🔧 Helper Functions

### From types/pricing.ts
```typescript
import {
  getCurrencySymbol,
  formatPrice,
  calculateSavings,
  isEarlyBirdActive,
  hasAvailableSpots,
  calculateInstallmentAmount
} from '@/types/pricing'

// Usage
const symbol = getCurrencySymbol('USD') // '$'
const formatted = formatPrice(299.99, 'USD') // '$299.99'
const savings = calculateSavings(299, 199) // { amount: 100, percentage: 33 }
const isActive = isEarlyBirdActive('2025-02-15') // true/false
const hasSpots = hasAvailableSpots(50, 45) // true
const installment = calculateInstallmentAmount(300, 100, 3) // 66.67
```

---

## 🔔 Webhook Events

### Stripe Events to Handle
```typescript
// Payment Intent
'payment_intent.succeeded'
'payment_intent.payment_failed'

// Subscription
'customer.subscription.created'
'customer.subscription.updated'
'customer.subscription.deleted'
'customer.subscription.trial_will_end'

// Invoice
'invoice.paid'
'invoice.payment_failed'
```

### Webhook Setup
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Get webhook secret
stripe listen --print-secret
```

---

## 🧪 Testing

### Test Subscription
```bash
curl -X POST http://localhost:3000/api/payments/subscription \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-uuid",
    "subscriptionType": "monthly",
    "subscriptionPrice": 29.99,
    "currency": "USD",
    "autoRenewal": true,
    "freeTrialDays": 7
  }'
```

### Test Payment Plan
```bash
curl -X POST http://localhost:3000/api/payments/installment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_plan",
    "courseId": "course-uuid",
    "totalAmount": 299,
    "currency": "USD",
    "numInstallments": 3,
    "frequency": "monthly",
    "downPayment": 100
  }'
```

### Test Free Trial
```bash
curl -X POST http://localhost:3000/api/payments/trial \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-uuid",
    "trialDays": 7,
    "requiresCard": false
  }'
```

---

## 🐛 Common Issues

### Issue: Stripe not initialized
```
Error: Stripe is not initialized
Solution: Set STRIPE_SECRET_KEY in .env
```

### Issue: Webhook signature verification failed
```
Error: Invalid signature
Solution: Set STRIPE_WEBHOOK_SECRET correctly
```

### Issue: Payment plan creation fails
```
Error: Failed to create payment plan
Solution: Check numInstallments (2-12) and frequency (weekly/biweekly/monthly)
```

### Issue: Trial already used
```
Error: You have already used your free trial
Solution: Each student can only use one trial per course
```

---

## 📊 Status Values

### Batch Status
```typescript
'upcoming' | 'registration_open' | 'registration_closed' |
'in_progress' | 'completed' | 'cancelled'
```

### Payment Plan Status
```typescript
'active' | 'completed' | 'defaulted' | 'cancelled'
```

### Installment Status
```typescript
'pending' | 'paid' | 'failed' | 'refunded' | 'waived'
```

### Subscription Status
```typescript
'active' | 'past_due' | 'cancelled' | 'paused'
```

### Waitlist Status
```typescript
'waiting' | 'notified' | 'enrolled' | 'expired' | 'cancelled'
```

---

## 🔗 Related Files

### Core Files
- `types/pricing.ts` - Type definitions
- `supabase/migrations/20250108000001_enhanced_pricing_enrollment.sql` - Database schema

### Payment Services
- `lib/payments/stripe.ts` - Stripe service
- `lib/payments/subscriptions.ts` - Subscription management
- `lib/payments/installments.ts` - Installment management
- `lib/payments/trials.ts` - Trial management

### API Routes
- `app/api/payments/subscription/route.ts`
- `app/api/payments/installment/route.ts`
- `app/api/payments/trial/route.ts`
- `app/api/webhooks/stripe/route.ts`

### Documentation
- `ENHANCED_PRICING_ENROLLMENT_IMPLEMENTATION_PLAN.md` - Full plan
- `ENHANCED_PRICING_PHASES_1_8_COMPLETE.md` - Complete summary
- `ENHANCED_PRICING_PHASE_8_COMPLETE.md` - Payment integration details

---

## 💡 Best Practices

### 1. Always validate input
```typescript
if (!courseId || !subscriptionType || !subscriptionPrice) {
  return { error: 'Missing required fields' }
}
```

### 2. Check authentication
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return { error: 'Unauthorized' }
}
```

### 3. Verify ownership
```typescript
const { data: enrollment } = await supabase
  .from('enrollments')
  .select('student_id')
  .eq('id', enrollmentId)
  .single()

if (enrollment.student_id !== user.id) {
  return { error: 'Unauthorized' }
}
```

### 4. Handle errors gracefully
```typescript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error)
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  }
}
```

### 5. Log important events
```typescript
await supabase
  .from('payment_logs')
  .insert({
    user_id: userId,
    course_id: courseId,
    amount: amount,
    status: 'succeeded',
    transaction_id: transactionId
  })
```

---

## 🎯 Quick Tips

1. **Use TypeScript types** - Import from `@/types/pricing`
2. **Test with Stripe CLI** - Use test mode for development
3. **Check webhook logs** - Monitor Stripe dashboard
4. **Validate all inputs** - Never trust client data
5. **Handle rollbacks** - Clean up on failures
6. **Log everything** - Use payment_logs table
7. **Test edge cases** - Expired trials, failed payments, etc.
8. **Use environment variables** - Never hardcode secrets
9. **Follow naming conventions** - Use existing patterns
10. **Document changes** - Update this guide

---

**Last Updated**: January 8, 2025  
**Version**: 1.0.0  
**Status**: 80% Complete

For detailed information, see the full documentation files.
