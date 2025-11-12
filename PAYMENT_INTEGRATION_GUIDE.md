# Payment Integration Guide

## Overview
This guide covers the comprehensive payment integration system with support for multiple payment gateways: Stripe, PayPal, and Razorpay.

## Features Implemented

### 1. Payment Gateways
- **Stripe**: Credit/Debit cards, Apple Pay, Google Pay
- **PayPal**: PayPal account payments
- **Razorpay**: UPI, Cards, Net Banking, Wallets (for Indian market)

### 2. Core Functionality
- ✅ One-time course purchases
- ✅ Subscription management
- ✅ Coupon/discount codes
- ✅ Refund processing
- ✅ Invoice generation
- ✅ Webhook handlers for all gateways
- ✅ Payment verification
- ✅ Secure checkout flow

### 3. Pages Created
- `/checkout/[courseId]` - Main checkout page
- `/checkout/payment` - Payment processing page
- `/checkout/success` - Payment success page
- `/checkout/failure` - Payment failure page

## File Structure

```
lib/payments/
├── stripe.ts          # Stripe service
├── paypal.ts          # PayPal service
└── razorpay.ts        # Razorpay service

app/api/payments/
├── create-order/      # Create payment order
├── verify/            # Verify payment
├── refund/            # Process refunds
├── validate-coupon/   # Validate coupon codes
├── intent/            # Get payment intent
├── invoice/[orderId]/ # Generate invoices
└── subscription/
    ├── create/        # Create subscription
    └── cancel/        # Cancel subscription

app/api/webhooks/
├── stripe/            # Stripe webhook handler
├── paypal/            # PayPal webhook handler
└── razorpay/          # Razorpay webhook handler

components/payment/
├── OrderSummary.tsx           # Order summary component
├── SubscriptionPlans.tsx      # Subscription plans display
├── CouponInput.tsx            # Coupon code input
└── PaymentMethodSelector.tsx  # Payment method selection
```

## Environment Variables

Add these to your `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint: `/api/webhooks/stripe`
4. Add webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`

### 3. PayPal Setup

1. Create account at https://developer.paypal.com
2. Create REST API app
3. Get Client ID and Secret
4. Set up webhook endpoint: `/api/webhooks/paypal`
5. Subscribe to events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### 4. Razorpay Setup

1. Create account at https://razorpay.com
2. Get API keys from Settings > API Keys
3. Set up webhook endpoint: `/api/webhooks/razorpay`
4. Add webhook events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `subscription.charged`
   - `subscription.cancelled`

## Usage Examples

### Basic Checkout Flow

```typescript
// 1. User selects course and goes to checkout
router.push(`/checkout/${courseId}`)

// 2. User selects payment method and applies coupon
// 3. System creates payment order
const response = await fetch('/api/payments/create-order', {
  method: 'POST',
  body: JSON.stringify({
    courseId,
    paymentMethod: 'stripe',
    couponCode: 'SAVE20',
    amount: 199
  })
})

// 4. User completes payment
// 5. Webhook confirms payment
// 6. User redirected to success page
```

### Subscription Management

```typescript
// Create subscription
const response = await fetch('/api/payments/subscription/create', {
  method: 'POST',
  body: JSON.stringify({
    paymentMethod: 'stripe',
    priceId: 'price_xxx',
    userId: 'user_123',
    courseId: 'course_456'
  })
})

// Cancel subscription
await fetch('/api/payments/subscription/cancel', {
  method: 'POST',
  body: JSON.stringify({
    subscriptionId: 'sub_xxx',
    paymentMethod: 'stripe',
    cancelAtPeriodEnd: true
  })
})
```

### Process Refund

```typescript
const response = await fetch('/api/payments/refund', {
  method: 'POST',
  body: JSON.stringify({
    paymentId: 'pi_xxx',
    paymentMethod: 'stripe',
    amount: 99.50, // Optional: partial refund
    reason: 'Customer request'
  })
})
```

## Security Features

1. **Webhook Signature Verification**: All webhooks verify signatures
2. **SSL Encryption**: All payment data transmitted over HTTPS
3. **PCI Compliance**: No card data stored on servers
4. **Environment Variables**: Sensitive keys stored securely
5. **Server-side Processing**: All payment logic on backend

## Testing

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### PayPal Sandbox
Use sandbox accounts from PayPal Developer Dashboard

### Razorpay Test Mode
Use test API keys for development

## Database Schema (TODO)

You'll need to create these tables:

```sql
-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payment_method VARCHAR(20),
  payment_intent_id VARCHAR(255),
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  subscription_id VARCHAR(255),
  payment_method VARCHAR(20),
  status VARCHAR(20),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refunds table
CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES payments(id),
  amount DECIMAL(10,2),
  reason TEXT,
  refund_id VARCHAR(255),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

1. **Database Integration**: Connect payment APIs to Supabase
2. **Email Notifications**: Send payment confirmations
3. **Invoice Generation**: Implement PDF invoice generation
4. **Admin Dashboard**: Add payment management UI
5. **Analytics**: Track payment metrics
6. **Tax Calculation**: Implement tax rules
7. **Multi-currency**: Support multiple currencies
8. **Saved Cards**: Allow users to save payment methods

## Support

For issues or questions:
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com/docs
- Razorpay: https://razorpay.com/docs

## License

This payment integration is part of the St Haroon School platform.
