# Quick Deployment Guide
**For St Haroon Online School Platform**

## 🚀 Deploy in 15 Minutes

### Step 1: Prepare Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note down: Project URL and API Keys

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Push migrations
   supabase db push
   ```

3. **Set up Storage Buckets**
   - The migrations will create these automatically
   - Verify in Supabase Dashboard > Storage

### Step 2: Deploy to Vercel (5 minutes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Login to Vercel
   vercel login

   # Deploy (follow prompts)
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all variables from `.env.example`

### Step 3: Configure Services (5 minutes)

1. **Stripe** (if using)
   - Get keys from https://dashboard.stripe.com
   - Set up webhooks pointing to: `https://your-domain.vercel.app/api/webhooks/stripe`

2. **Resend Email**
   - Get API key from https://resend.com
   - Verify your sending domain

3. **Google Gemini** (for chatbot)
   - Get API key from https://makersuite.google.com/app/apikey

4. **Zoom/Google Meet** (optional)
   - Configure OAuth credentials
   - Set redirect URLs

### Step 4: Test & Launch

1. **Test Critical Flows**
   - User registration
   - Course enrollment
   - Payment processing
   - Email delivery

2. **Go Live!**
   ```bash
   vercel --prod
   ```

---

## 📋 Essential Environment Variables

### Required (Minimum to Run)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Auth
NEXTAUTH_SECRET=generate-random-32-char-string
NEXTAUTH_URL=https://your-domain.vercel.app

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@yourdomain.com

# AI Chatbot
GEMINI_API_KEY=AIzxxx
```

### Payment Gateway (Choose One)
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OR PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# OR Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## 🔧 Quick Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run type-check   # Check TypeScript
```

### Database
```bash
supabase db push     # Push migrations
supabase db pull     # Pull schema
supabase db reset    # Reset database (dev only!)
```

### Deployment
```bash
vercel               # Deploy to preview
vercel --prod        # Deploy to production
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
- Check Supabase project status
- Verify environment variables
- Check RLS policies are enabled

### Payment Webhook Issues
- Verify webhook URL in payment provider dashboard
- Check webhook secret matches environment variable
- Test with webhook testing tools

### Email Not Sending
- Verify Resend API key
- Check domain verification
- Review email logs in Resend dashboard

---

## 📞 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Resend Dashboard**: https://resend.com/dashboard
- **Google AI Studio**: https://makersuite.google.com

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] Payment webhooks configured
- [ ] Email domain verified
- [ ] Test user registration
- [ ] Test course enrollment
- [ ] Test payment processing
- [ ] Test email delivery
- [ ] Test live classes (if using)
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

---

## 🎯 First Admin User

After deployment, create your first admin user:

1. Register through the normal registration flow
2. Go to Supabase Dashboard > Table Editor > user_profiles
3. Find your user and set:
   - `role` = 'admin'
   - `role_level` = 5
4. Log out and log back in

---

**That's it! Your platform is live! 🎉**

For detailed documentation, see:
- `FINAL_PROJECT_STATUS.md` - Complete feature list
- `BUILD_SUCCESS_SUMMARY.md` - Build details
- `DEPLOYMENT_CHECKLIST.md` - Detailed deployment steps
