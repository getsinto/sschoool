# Enhanced Pricing & Enrollment System - Deployment Guide

**Version**: 1.0.0  
**Last Updated**: January 8, 2025  
**Status**: Production Ready

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database ready
- [ ] Supabase project created
- [ ] Stripe account created
- [ ] Domain configured (if production)

### 2. Required Accounts
- [ ] Supabase account with project
- [ ] Stripe account (test mode for staging)
- [ ] Email service (for notifications)
- [ ] CDN/Storage (for media files)

### 3. Code Preparation
- [ ] All migrations tested locally
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Tests passing

---

## 🔧 Step 1: Database Setup

### 1.1 Run Database Migration

```bash
# Navigate to project directory
cd your-project

# Run the enhanced pricing migration
psql -h your-db-host -U your-db-user -d your-db-name -f supabase/migrations/20250108000001_enhanced_pricing_enrollment.sql
```

### 1.2 Verify Tables Created

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'course_batches',
  'course_bundles',
  'course_waitlist',
  'payment_plans',
  'installment_payments',
  'bundle_enrollments'
);

-- Should return 6 rows
```

### 1.3 Verify RLS Policies

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN (
  'course_batches',
  'course_bundles',
  'course_waitlist',
  'payment_plans',
  'installment_payments'
);

-- Should return 20+ policies
```

### 1.4 Test Helper Functions

```sql
-- Test batch status calculation
SELECT calculate_batch_status(
  '2025-01-01'::date,  -- start_date
  '2025-06-30'::date,  -- end_date
  '2024-12-01'::date,  -- registration_opens
  '2024-12-31'::date   -- registration_closes
);

-- Should return appropriate status
```

---

## 🔐 Step 2: Environment Variables

### 2.1 Create .env.local File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... for production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Your domain for production
NODE_ENV=development # Use 'production' for production
```

### 2.2 Verify Environment Variables

```bash
# Check if all required variables are set
node -e "
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

require('dotenv').config({ path: '.env.local' });

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
} else {
  console.log('All required environment variables are set!');
}
"
```

---

## 💳 Step 3: Stripe Configuration

### 3.1 Create Stripe Products (Optional)

You can create products manually in Stripe dashboard or let the system create them automatically.

### 3.2 Set Up Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 3.3 Test Webhook Locally (Development)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret and add to .env.local
```

### 3.4 Test Webhook

```bash
# Trigger a test event
stripe trigger payment_intent.succeeded

# Check your terminal for webhook logs
```

---

## 📦 Step 4: Install Dependencies

```bash
# Install all dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

---

## 🏗️ Step 5: Build Application

### 5.1 Development Build

```bash
# Run development server
npm run dev

# Visit http://localhost:3000
```

### 5.2 Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### 5.3 Verify Build

```bash
# Check for build errors
# Should complete without errors

# Check build output
ls -la .next/

# Should see:
# - .next/server/
# - .next/static/
# - .next/cache/
```

---

## 🧪 Step 6: Testing

### 6.1 Test Database Connection

```bash
# Create a test API route
curl http://localhost:3000/api/test-db

# Should return success
```

### 6.2 Test Pricing Models

1. **Free Course**
   - Create course with free pricing
   - Verify instant enrollment

2. **One-time Payment**
   - Create course with one-time pricing
   - Test payment flow
   - Verify enrollment created

3. **Subscription**
   - Create course with subscription
   - Test subscription creation
   - Verify recurring billing

4. **Payment Plan**
   - Create course with payment plan
   - Test installment creation
   - Verify payment schedule

5. **Free Trial**
   - Create course with free trial
   - Test trial enrollment
   - Verify trial conversion

### 6.3 Test Batch Management

```bash
# Create a batch
curl -X POST http://localhost:3000/api/teacher/courses/[id]/batches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batch_name": "Test Batch",
    "start_date": "2025-02-01",
    "end_date": "2025-07-31",
    "registration_opens": "2025-01-01",
    "registration_closes": "2025-01-31",
    "max_students": 50
  }'

# Should return batch object
```

### 6.4 Test Admin Dashboards

1. Visit `/admin/pricing-analytics`
2. Visit `/admin/batches`
3. Visit `/admin/waitlist`
4. Verify data loads correctly

---

## 🚀 Step 7: Deployment

### 7.1 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to configure project
```

### 7.2 Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure to use production values for:
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
   - `STRIPE_WEBHOOK_SECRET` (production webhook secret)

### 7.3 Update Stripe Webhook URL

1. Go to Stripe Dashboard → Webhooks
2. Update webhook URL to: `https://yourdomain.com/api/webhooks/stripe`
3. Copy new webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 7.4 Deploy to Production

```bash
# Deploy to production
vercel --prod
```

---

## ✅ Step 8: Post-Deployment Verification

### 8.1 Verify Deployment

```bash
# Check if site is live
curl https://yourdomain.com

# Should return 200 OK
```

### 8.2 Test Critical Paths

1. **User Registration**
   - Register new user
   - Verify email
   - Login

2. **Course Creation**
   - Login as teacher
   - Create course
   - Configure pricing

3. **Enrollment**
   - Login as student
   - View course
   - Enroll in course

4. **Payment Processing**
   - Test payment
   - Verify webhook received
   - Check enrollment created

5. **Admin Dashboards**
   - Login as admin
   - View analytics
   - Check data accuracy

### 8.3 Monitor Logs

```bash
# Vercel logs
vercel logs

# Or in Vercel Dashboard → Your Project → Logs
```

---

## 🔍 Step 9: Monitoring & Maintenance

### 9.1 Set Up Monitoring

1. **Vercel Analytics**
   - Enable in Vercel Dashboard
   - Monitor page views and performance

2. **Stripe Dashboard**
   - Monitor payments
   - Check webhook deliveries
   - Review failed payments

3. **Supabase Dashboard**
   - Monitor database performance
   - Check query performance
   - Review logs

### 9.2 Regular Maintenance Tasks

**Daily:**
- Check webhook delivery status
- Monitor failed payments
- Review error logs

**Weekly:**
- Review pricing analytics
- Check batch enrollments
- Monitor waitlist status

**Monthly:**
- Review subscription churn
- Analyze payment plan completion
- Optimize pricing strategies

---

## 🐛 Troubleshooting

### Issue: Webhook Not Receiving Events

**Solution:**
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Stripe webhook logs
4. Test with Stripe CLI

```bash
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Issue: Database Connection Failed

**Solution:**
1. Verify Supabase URL and keys
2. Check database is running
3. Verify RLS policies
4. Check service role key permissions

### Issue: Payment Processing Failed

**Solution:**
1. Check Stripe keys (test vs live)
2. Verify webhook secret
3. Check payment intent creation
4. Review Stripe logs

### Issue: Build Failed

**Solution:**
1. Check TypeScript errors: `npm run type-check`
2. Verify all dependencies installed
3. Clear `.next` folder: `rm -rf .next`
4. Rebuild: `npm run build`

---

## 📊 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_course_batches_course_id ON course_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_course_batches_status ON course_batches(status);
CREATE INDEX IF NOT EXISTS idx_course_waitlist_course_id ON course_waitlist(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_student_id ON payment_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_plan_id ON installment_payments(payment_plan_id);
```

### 2. Caching Strategy

- Enable Vercel Edge Caching for static pages
- Cache pricing data for 5 minutes
- Cache batch data for 1 minute
- Real-time data for enrollments

### 3. Image Optimization

- Use Next.js Image component
- Optimize course thumbnails
- Use WebP format
- Implement lazy loading

---

## 🔒 Security Checklist

- [ ] All environment variables secured
- [ ] RLS policies enabled on all tables
- [ ] Webhook signature verification active
- [ ] HTTPS enabled (production)
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## 📝 Rollback Plan

### If Issues Occur:

1. **Revert Deployment**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Revert Database**
   ```sql
   -- Drop new tables (if needed)
   DROP TABLE IF EXISTS bundle_enrollments CASCADE;
   DROP TABLE IF EXISTS installment_payments CASCADE;
   DROP TABLE IF EXISTS payment_plans CASCADE;
   DROP TABLE IF EXISTS course_waitlist CASCADE;
   DROP TABLE IF EXISTS course_bundles CASCADE;
   DROP TABLE IF EXISTS course_batches CASCADE;
   ```

3. **Restore Backup**
   - Use Supabase backup restore
   - Or restore from manual backup

---

## 📞 Support & Resources

### Documentation
- Implementation Plan: `ENHANCED_PRICING_ENROLLMENT_IMPLEMENTATION_PLAN.md`
- Quick Reference: `ENHANCED_PRICING_QUICK_REFERENCE.md`
- API Documentation: See API routes

### External Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## ✅ Deployment Complete!

Your Enhanced Pricing & Enrollment System is now live! 🎉

**Next Steps:**
1. Monitor initial usage
2. Gather user feedback
3. Optimize based on analytics
4. Plan future enhancements

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: January 8, 2025

