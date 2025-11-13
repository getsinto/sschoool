# Deployment Guide - St Haroon Online School

Complete guide for deploying the application to Vercel with all necessary configurations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Configuration](#vercel-configuration)
4. [Database Migration](#database-migration)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Rollback Procedure](#rollback-procedure)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- Git repository (GitHub/GitLab)
- Vercel account
- Supabase project configured
- All third-party API keys ready

## Environment Setup

### 1. Required Environment Variables

Add these variables in Vercel Dashboard → Project Settings → Environment Variables:

#### Core Configuration
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com
```

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

#### Payment Gateways
```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=production
PAYPAL_WEBHOOK_ID=your_webhook_id

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Email Service
```bash
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

#### Live Classes
```bash
# Zoom
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# Google Meet
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback
```

#### AI Chatbot
```bash
GEMINI_API_KEY=your_gemini_api_key
```

#### Security
```bash
ENCRYPTION_KEY=<32-character-random-string>
JWT_SECRET=<random-secret-key>
```

### 2. Environment-Specific Variables

Set different values for each environment:

- **Production**: Use live API keys, production URLs
- **Preview**: Use test API keys, staging URLs
- **Development**: Use test API keys, localhost URLs

## Vercel Configuration

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository

### 2. Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all variables from the list above
3. Set appropriate values for each environment:
   - Production
   - Preview
   - Development

### 4. Configure Domains

1. Go to Project Settings → Domains
2. Add your custom domain: `yourdomain.com`
3. Add www subdomain: `www.yourdomain.com`
4. Update DNS records as instructed by Vercel
5. Enable automatic HTTPS (handled by Vercel)

## Database Migration

### Before First Deployment

Run migrations to set up your database:

```bash
# Install dependencies
npm install

# Run migrations
npx ts-node scripts/migrate.ts
```

### Migration Script

The `scripts/migrate.ts` file will:
- Read all SQL files from `supabase/migrations/`
- Execute them in order
- Track completed migrations

### Manual Migration (if needed)

1. Go to Supabase Dashboard → SQL Editor
2. Copy content from each migration file
3. Execute in order (001, 002, 003, etc.)

## Deployment Steps

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"

# Push to main branch
git push origin main
```

### Step 2: Initial Deployment

1. Vercel will automatically detect the push
2. Build process starts automatically
3. Monitor build logs in Vercel Dashboard
4. Wait for deployment to complete

### Step 3: Verify Deployment

1. Visit your deployment URL
2. Check health endpoint: `https://yourdomain.com/api/health`
3. Test key features:
   - User registration
   - Login/logout
   - Course enrollment
   - Payment processing
   - Live class creation
   - Email delivery

### Step 4: Configure Webhooks

Set up webhooks for payment providers:

#### Stripe Webhook
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.failed`, `customer.subscription.updated`

#### PayPal Webhook
- URL: `https://yourdomain.com/api/webhooks/paypal`
- Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

#### Razorpay Webhook
- URL: `https://yourdomain.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`, `subscription.charged`

#### Zoom Webhook
- URL: `https://yourdomain.com/api/webhooks/zoom`
- Events: `meeting.started`, `meeting.ended`, `recording.completed`

## Post-Deployment

### 1. Health Check

Visit the health endpoint to verify all services:

```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" },
    "storage": { "status": "ok" },
    "email": { "status": "ok" },
    "payments": { "status": "ok" }
  }
}
```

### 2. Test Critical Flows

- [ ] User registration and email verification
- [ ] Login with different user roles
- [ ] Course enrollment
- [ ] Payment processing (use test mode first)
- [ ] Live class scheduling
- [ ] Assignment submission
- [ ] Quiz taking
- [ ] Email notifications
- [ ] Chatbot functionality

### 3. Performance Optimization

1. Enable Vercel Analytics:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to `app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

### 4. Set Up Monitoring

1. **Uptime Monitoring**: Use UptimeRobot or Pingdom
   - Monitor: `https://yourdomain.com/api/health`
   - Check interval: 5 minutes
   - Alert on: Status code != 200

2. **Error Tracking**: Install Sentry (optional)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Log Monitoring**: Check Vercel logs regularly
   - Go to Vercel Dashboard → Logs
   - Filter by error level
   - Set up log drains if needed

## Monitoring

### Daily Checks

- [ ] Check Vercel deployment status
- [ ] Review error logs
- [ ] Monitor health endpoint
- [ ] Check payment processing
- [ ] Verify email delivery

### Weekly Checks

- [ ] Review performance metrics
- [ ] Check database size and growth
- [ ] Review user feedback
- [ ] Test backup restoration
- [ ] Update dependencies

### Monthly Checks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] Feature usage analytics
- [ ] Database optimization

## Rollback Procedure

### Quick Rollback (Vercel Dashboard)

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

### Database Rollback

If database changes need to be reverted:

1. Restore from backup:
   ```bash
   # Download backup from GitHub Actions artifacts
   # Or use Supabase backup
   ```

2. Run rollback migration:
   ```bash
   npx ts-node scripts/rollback-migration.ts
   ```

### Emergency Rollback

If site is completely down:

1. Immediately promote last working deployment
2. Investigate issue in preview environment
3. Fix and redeploy when ready

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found
```bash
# Solution: Clear cache and rebuild
vercel --force
```

**Issue**: TypeScript errors
```bash
# Temporarily ignore (not recommended for production)
# Update next.config.js:
typescript: {
  ignoreBuildErrors: true
}
```

### Runtime Errors

**Issue**: 500 Internal Server Error
- Check Vercel logs for error details
- Verify environment variables are set
- Check database connection

**Issue**: API routes not working
- Verify route files are in `app/api/` directory
- Check middleware configuration
- Verify CORS headers

### Database Issues

**Issue**: Connection timeout
- Check Supabase project status
- Verify DATABASE_URL is correct
- Check connection pooling settings

**Issue**: Migration failed
- Review migration SQL for errors
- Check database permissions
- Run migrations manually in Supabase

### Payment Issues

**Issue**: Webhook not receiving events
- Verify webhook URL is correct
- Check webhook secret matches
- Test webhook with provider's testing tool
- Review webhook logs in provider dashboard

### Email Issues

**Issue**: Emails not sending
- Verify RESEND_API_KEY is correct
- Check FROM_EMAIL domain is verified
- Review Resend dashboard for errors
- Check email logs in database

## Backup Strategy

### Automated Backups

GitHub Actions runs daily backups at 2 AM UTC:
- Backs up all database tables
- Stores as JSON artifacts
- Retains for 30 days

### Manual Backup

```bash
# Run backup script
npx ts-node scripts/backup-database.ts

# Backup will be saved to backups/ directory
```

### Supabase Backups

Supabase provides automatic backups:
- Point-in-time recovery (paid plans)
- Daily backups (all plans)
- Access via Supabase Dashboard

## Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured
- [ ] Rate limiting is implemented
- [ ] API keys are rotated regularly
- [ ] Database RLS policies are active
- [ ] File upload validation is working
- [ ] CORS is properly configured
- [ ] Webhook signatures are verified
- [ ] User input is sanitized

## Performance Checklist

- [ ] Images are optimized
- [ ] API routes use caching where appropriate
- [ ] Database queries are optimized
- [ ] Static pages are pre-rendered
- [ ] CDN is configured (automatic with Vercel)
- [ ] Bundle size is optimized
- [ ] Lazy loading is implemented
- [ ] Analytics are tracking correctly

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Payment Provider Support**: Check respective dashboards
- **Internal Team**: [Add your team contacts]

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Project README](./README.md)

---

**Last Updated**: November 2025
**Version**: 1.0.0
