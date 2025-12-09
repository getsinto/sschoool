# Production Deployment Guide

## Overview

This comprehensive guide covers deploying the online education platform to production with all features including Google Meet OAuth, file uploads, monitoring, and session management.

## Prerequisites

- [ ] Vercel account (or alternative hosting)
- [ ] Supabase project configured
- [ ] Google Cloud project with OAuth credentials
- [ ] Sentry project for monitoring
- [ ] Domain name configured
- [ ] SSL certificate (handled by Vercel)
- [ ] Environment variables documented

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in development

### Database
- [ ] All migrations applied to production database
- [ ] RLS policies enabled and tested
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Indexes created for performance

### Security
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention verified

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] CDN configured for static assets
- [ ] Database queries optimized

## Step 1: Environment Configuration

### Production Environment Variables

Create a `.env.production` file (DO NOT commit):

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback

# Zoom OAuth
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
ZOOM_REDIRECT_URI=https://yourdomain.com/api/zoom/callback

# Payment Gateways
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0

# AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# Session
SESSION_SECRET=your-session-secret-min-32-chars
SESSION_TIMEOUT=1800000  # 30 minutes in milliseconds

# File Upload
MAX_UPLOAD_SIZE=524288000  # 500 MB
ENABLE_MALWARE_SCAN=true
CLAMAV_HOST=your-clamav-host
CLAMAV_PORT=3310

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

## Step 2: Vercel Deployment

### Initial Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link project:
```bash
vercel link
```

### Configure Environment Variables

```bash
# Add all environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add all other variables
```

Or use the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope (Production, Preview, Development)

### Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or use Git integration
git push origin main  # Triggers automatic deployment
```

### Vercel Configuration

Ensure `vercel.json` is configured:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SENTRY_RELEASE": "1.0.0"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://yourdomain.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## Step 3: Database Migration

### Apply Production Migrations

```bash
# Connect to production database
export DATABASE_URL="postgresql://..."

# Run migrations
npx supabase db push

# Or use Supabase CLI
supabase db push --db-url "postgresql://..."
```

### Verify Migrations

```sql
-- Check migration status
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;

-- Verify critical tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Step 4: Post-Deployment Verification

### Automated Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    email: await checkEmail(),
    monitoring: await checkMonitoring(),
  };

  const allHealthy = Object.values(checks).every(c => c.healthy);

  return Response.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: allHealthy ? 200 : 503,
  });
}
```

### Manual Verification Checklist

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Google Meet OAuth flow works
- [ ] File upload works
- [ ] Payment processing works
- [ ] Email notifications send
- [ ] Session timeout works
- [ ] Sentry captures errors
- [ ] All API endpoints respond
- [ ] Database queries execute
- [ ] Storage buckets accessible

### Test Critical Flows

```bash
# Run end-to-end tests against production
npm run test:e2e -- --baseUrl=https://yourdomain.com
```

## Step 5: Monitoring Setup

### Configure Uptime Monitoring

1. **Vercel Analytics**: Automatically enabled

2. **External Monitoring** (UptimeRobot, Pingdom):
   - Monitor: `https://yourdomain.com/api/health`
   - Interval: 5 minutes
   - Alert on: Status code != 200

3. **Sentry Performance**:
   - Verify transactions are being tracked
   - Check for performance issues
   - Set up alerts for slow endpoints

### Set Up Alerts

1. **Error Alerts**:
   - Sentry: Critical errors → Email + Slack
   - Vercel: Build failures → Email

2. **Performance Alerts**:
   - API response time > 2s
   - Database query time > 1s
   - Error rate > 1%

3. **Business Alerts**:
   - Payment failures
   - Failed registrations
   - OAuth connection failures

## Step 6: DNS Configuration

### Configure Domain

1. Add domain in Vercel:
   - Go to Project Settings → Domains
   - Add your domain: `yourdomain.com`
   - Add www subdomain: `www.yourdomain.com`

2. Update DNS records:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. Wait for DNS propagation (up to 48 hours)

4. Verify SSL certificate is issued

## Step 7: CDN and Caching

### Configure Caching Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

### Supabase CDN

Configure CDN for storage:
1. Go to Supabase → Storage → Settings
2. Enable CDN
3. Configure cache rules

## Step 8: Security Hardening

### Enable Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

### Configure Rate Limiting

Verify rate limiting is active:
```typescript
// Test rate limiting
for (let i = 0; i < 150; i++) {
  await fetch('https://yourdomain.com/api/test');
}
// Should receive 429 after 100 requests
```

## Step 9: Backup Strategy

### Database Backups

1. **Supabase Automatic Backups**:
   - Daily backups enabled by default
   - Retention: 7 days (free tier)

2. **Manual Backup Script**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### File Storage Backups

```bash
# Backup Supabase storage
supabase storage download --bucket course-materials --path ./backups/
```

## Step 10: Rollback Plan

### Quick Rollback

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific version
vercel --prod --force
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_20240109_120000.sql
```

## Monitoring and Maintenance

### Daily Checks

- [ ] Check Sentry for new errors
- [ ] Review Vercel analytics
- [ ] Monitor database performance
- [ ] Check storage usage
- [ ] Review failed payments

### Weekly Tasks

- [ ] Review and resolve Sentry issues
- [ ] Analyze performance metrics
- [ ] Check for security updates
- [ ] Review user feedback
- [ ] Update documentation

### Monthly Tasks

- [ ] Rotate API keys
- [ ] Review and optimize database
- [ ] Analyze costs and usage
- [ ] Update dependencies
- [ ] Conduct security audit

## Troubleshooting

### Deployment Fails

1. Check build logs in Vercel
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors

### Database Connection Issues

1. Verify connection string
2. Check IP whitelist in Supabase
3. Test connection: `psql $DATABASE_URL`
4. Review connection pool settings

### OAuth Not Working

1. Verify redirect URIs match exactly
2. Check environment variables
3. Test OAuth flow in incognito mode
4. Review Google Cloud Console settings

### File Uploads Failing

1. Check Supabase storage quotas
2. Verify RLS policies
3. Test with small file first
4. Review error logs in Sentry

## Performance Optimization

### Database Optimization

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_courses_teacher ON courses(teacher_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM courses WHERE teacher_id = 'xxx';
```

### Image Optimization

- Use Next.js Image component
- Enable WebP format
- Implement lazy loading
- Use appropriate image sizes

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

## Support and Documentation

### Internal Documentation

- API documentation: `/docs/api`
- Database schema: `/docs/database`
- Architecture diagrams: `/docs/architecture`
- Runbooks: `/docs/runbooks`

### External Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)

## Success Criteria

- [ ] All health checks passing
- [ ] Zero critical errors in Sentry
- [ ] API response time < 500ms (P95)
- [ ] Uptime > 99.9%
- [ ] All features working as expected
- [ ] Team trained on monitoring tools
- [ ] Documentation complete
- [ ] Backup strategy tested
- [ ] Rollback plan verified

## Next Steps

1. Monitor production for 48 hours
2. Gather user feedback
3. Address any issues found
4. Plan next release
5. Document lessons learned
