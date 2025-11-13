# Vercel Setup Guide

Quick start guide for deploying to Vercel.

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Verify your email

## Step 2: Import Project

1. Click "Add New Project"
2. Select your Git provider
3. Import the repository
4. Vercel auto-detects Next.js

## Step 3: Configure Environment Variables

Go to Project Settings → Environment Variables and add:

### Required Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=
FROM_EMAIL=

# Payments (at least one required)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Optional Variables

Add based on features you're using:
- PayPal credentials
- Razorpay credentials
- Zoom credentials
- Google Meet credentials
- Gemini API key

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit deployment URL

## Step 5: Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

## Step 6: Configure Webhooks

Update webhook URLs in:
- Stripe Dashboard
- PayPal Dashboard
- Razorpay Dashboard
- Zoom Marketplace

Format: `https://yourdomain.com/api/webhooks/[provider]`

## Step 7: Test Deployment

Visit: `https://yourdomain.com/api/health`

Should return:
```json
{
  "status": "healthy",
  "checks": { ... }
}
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify all dependencies in package.json
- Check TypeScript errors

### Environment Variables Not Working
- Ensure variables are set for correct environment
- Redeploy after adding variables
- Check variable names match exactly

### Domain Not Working
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check domain is not already in use

## Next Steps

- Set up monitoring
- Configure analytics
- Test all features
- Review security settings

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.
