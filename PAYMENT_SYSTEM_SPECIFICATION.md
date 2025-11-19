# 💳 Comprehensive Payment Integration System - Specification

## 📋 Overview

This document outlines the complete payment integration system for the LMS platform, supporting multiple payment gateways (PayPal, Razorpay, Stripe) with full checkout, subscription, refund, and invoice management capabilities.

## 🎯 System Status: TO BE IMPLEMENTED

**Priority**: HIGH  
**Complexity**: HIGH  
**Estimated Files**: 40+  
**Dependencies**: Stripe SDK, PayPal SDK, Razorpay SDK

---

## 📁 Required File Structure

### 1. Payment Gateway Libraries (3 files)

#### `lib/payments/stripe.ts`
- Initialize Stripe SDK
- Create payment intent
- Confirm payment
- Handle webhooks
- Create subscriptions
- Process refunds
- Manage customer portal

#### `lib/payments/paypal.ts`
- Initialize PayPal SDK
- Create order
- Capture payment
- Handle webhooks
- Process refunds
- Get transaction details

#### `lib/payments/razorpay.ts`
- Initialize Razorpay SDK
- Create order
- Verify payment signature
- Handle webhooks
- Process refunds
- Get payment details

---

### 2. Public Checkout Pages (3 files)

#### `app/(public)/checkout/[courseId]/page.tsx`
**Features:**
- Course summary display
- Student information (auto-filled)
- Coupon code input and validation
- Payment method selection (PayPal/Razorpay/Stripe)
- Order summary with calculations
- Terms and conditions checkbox
- Complete payment button

#### `app/(public)/checkout/success/page.tsx`
**Features:**
- Success animation
- Order confirmation
- Order details display
- Download invoice button
- Start learning button
- View courses button
- Email confirmation message

#### `app/(public)/checkout/failed/page.tsx`
**Features:**
- Failure message
- Reason display
- Order details
- Try again button
- Contact support button
- Alternative payment methods

---

### 3. Subscription Management (1 file)

#### `app/(dashboard)/student/subscriptions/page.tsx`
**Features:**
- Active subscriptions list
- Subscription details (billing cycle, next date, amount)
- Manage subscription (change payment, cancel, reactivate)
- Billing history
- Invoice downloads

---

### 4. Payment Components (7 files)

#### `components/payments/PayPalButton.tsx`
- PayPal button integration
- Order creation
- Payment capture
- Error handling

#### `components/payments/RazorpayCheckout.tsx`
- Razorpay checkout modal
- Multiple payment methods (Cards, UPI, NetBanking, Wallets)
- Payment verification

#### `components/payments/StripeCheckout.tsx`
- Stripe Elements integration
- Card input fields
- 3D Secure authentication
- Payment processing

#### `components/payments/CouponInput.tsx`
- Coupon code input field
- Apply/Remove buttons
- Validation feedback
- Discount display

#### `components/payments/OrderSummary.tsx`
- Subtotal display
- Discount calculation
- Tax calculation
- Total amount
- Payment method display

#### `components/payments/PaymentMethodSelector.tsx`
- Radio button selection
- Payment gateway logos
- Method descriptions
- Active state management

#### `components/payments/InvoiceTemplate.tsx`
- School logo and info
- Invoice number generation
- Billing information
- Order details table
- Payment information
- Terms and footer
- PDF generation ready

---

### 5. API Routes (18 files)

#### Payment Processing
- `app/api/payments/create-order/route.ts` - Initialize payment
- `app/api/payments/verify/route.ts` - Verify payment
- `app/api/payments/refund/route.ts` - Process refund

#### Coupon Management
- `app/api/payments/coupon/validate/route.ts` - Validate coupon code

#### Invoice Management
- `app/api/payments/invoice/[id]/route.ts` - Get/generate invoice

#### Subscription Management
- `app/api/payments/subscription/create/route.ts` - Create subscription
- `app/api/payments/subscription/cancel/route.ts` - Cancel subscription
- `app/api/payments/subscription/update/route.ts` - Update subscription

#### Webhook Handlers
- `app/api/webhooks/paypal/route.ts` - PayPal webhooks
- `app/api/webhooks/razorpay/route.ts` - Razorpay webhooks
- `app/api/webhooks/stripe/route.ts` - Stripe webhooks

#### Admin Refund Processing
- `app/(dashboard)/admin/payments/[id]/refund/page.tsx` - Refund UI

---

## 🔄 Payment Flows

### PayPal Flow
1. User clicks PayPal button
2. PayPal popup/redirect opens
3. User logs in and approves
4. Return to confirmation page
5. Server verifies payment
6. Create enrollment
7. Show success page

### Razorpay Flow
1. User clicks payment button
2. Razorpay modal opens
3. User selects method (Card/UPI/NetBanking/Wallet)
4. Complete payment
5. Razorpay returns payment ID
6. Server verifies signature
7. Create enrollment
8. Show success page

### Stripe Flow
1. User enters card details
2. Click "Pay Now"
3. Stripe processes payment
4. 3D Secure if required
5. Payment confirmed
6. Server receives webhook
7. Create enrollment
8. Show success page

---

## 🎯 Key Features

### Core Features
- ✅ Multi-gateway support (PayPal, Razorpay, Stripe)
- ✅ Secure checkout process
- ✅ Automatic enrollment on success
- ✅ Invoice auto-generation
- ✅ Email notifications
- ✅ Refund processing
- ✅ Subscription management

### Advanced Features
- ✅ Coupon system with validation
- ✅ Multi-currency support
- ✅ Tax calculation
- ✅ Payment retry mechanism
- ✅ Failed payment notifications
- ✅ Payment analytics
- ✅ Fraud prevention
- ✅ PCI DSS compliance

### Security Features
- ✅ Never store card details
- ✅ Use tokenization
- ✅ HTTPS only
- ✅ Input validation
- ✅ Webhook signature verification
- ✅ Duplicate transaction prevention
- ✅ Rate limiting
- ✅ 3D Secure authentication

---

## 📊 Database Schema Requirements

### Payments Table
```sql
- id (uuid)
- user_id (uuid)
- course_id (uuid)
- amount (decimal)
- currency (string)
- status (enum: pending, completed, failed, refunded)
- payment_method (enum: paypal, razorpay, stripe)
- transaction_id (string)
- gateway_response (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### Subscriptions Table
```sql
- id (uuid)
- user_id (uuid)
- course_id (uuid)
- plan_id (string)
- status (enum: active, cancelled, expired)
- billing_cycle (enum: monthly, yearly)
- next_billing_date (date)
- amount (decimal)
- payment_method (string)
- gateway_subscription_id (string)
- created_at (timestamp)
- updated_at (timestamp)
```

### Coupons Table
```sql
- id (uuid)
- code (string, unique)
- discount_type (enum: percentage, fixed)
- discount_value (decimal)
- valid_from (date)
- valid_until (date)
- usage_limit (integer)
- used_count (integer)
- applicable_courses (jsonb)
- is_active (boolean)
- created_at (timestamp)
```

### Invoices Table
```sql
- id (uuid)
- payment_id (uuid)
- invoice_number (string, unique)
- user_id (uuid)
- amount (decimal)
- tax (decimal)
- total (decimal)
- file_url (string)
- status (enum: generated, sent, paid)
- created_at (timestamp)
```

### Refunds Table
```sql
- id (uuid)
- payment_id (uuid)
- amount (decimal)
- reason (text)
- status (enum: pending, completed, failed)
- gateway_refund_id (string)
- processed_by (uuid)
- created_at (timestamp)
```

---

## 🔧 Environment Variables Required

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# General
PAYMENT_SUCCESS_URL=https://yourdomain.com/checkout/success
PAYMENT_CANCEL_URL=https://yourdomain.com/checkout/failed
```

---

## 📦 NPM Packages Required

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "@paypal/paypal-js": "^7.0.0",
    "razorpay": "^2.9.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  }
}
```

---

## 🚀 Implementation Priority

### Phase 1: Core Payment (HIGH PRIORITY)
1. Payment gateway libraries (Stripe, PayPal, Razorpay)
2. Checkout page with course summary
3. Payment method selection
4. Success/Failed pages
5. Basic API routes (create-order, verify)

### Phase 2: Enhanced Features (MEDIUM PRIORITY)
6. Coupon system
7. Invoice generation
8. Email notifications
9. Webhook handlers
10. Order summary component

### Phase 3: Advanced Features (LOW PRIORITY)
11. Subscription management
12. Refund processing
13. Payment analytics
14. Multi-currency support
15. Tax calculation

---

## ✅ Testing Checklist

### Payment Gateway Testing
- [ ] Stripe test card: 4242 4242 4242 4242
- [ ] PayPal sandbox account
- [ ] Razorpay test mode
- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Refund processing
- [ ] Webhook verification

### Security Testing
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Webhook signature verification
- [ ] Duplicate transaction prevention

### User Experience Testing
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error messages
- [ ] Success confirmations
- [ ] Email notifications
- [ ] Invoice generation

---

## 📝 Notes

1. **PCI Compliance**: Never store card details on your server. Always use tokenization provided by payment gateways.

2. **Webhook Security**: Always verify webhook signatures to ensure requests are from legitimate sources.

3. **Error Handling**: Implement comprehensive error handling for all payment scenarios.

4. **Testing**: Use sandbox/test modes for all gateways during development.

5. **Logging**: Log all payment transactions for audit and debugging purposes.

6. **User Communication**: Send clear email notifications for all payment events.

7. **Refund Policy**: Clearly communicate refund policies to users before payment.

---

## 🎯 Next Steps

1. Review this specification
2. Set up payment gateway accounts (Stripe, PayPal, Razorpay)
3. Install required NPM packages
4. Create database tables
5. Implement Phase 1 (Core Payment)
6. Test thoroughly in sandbox mode
7. Implement Phase 2 and 3
8. Deploy to production with live keys

---

**Status**: ⏳ AWAITING IMPLEMENTATION  
**Last Updated**: November 19, 2025  
**Estimated Development Time**: 40-60 hours
