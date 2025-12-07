# Vercel Production Deployment Checklist

## 🎯 Pre-Deployment Checklist

### ✅ Code Verification

- [x] All interactive components have `'use client'` directive
- [x] No Server Components using `onClick`, `onChange`, etc.
- [x] No Server Components using `useState`, `useEffect`, etc.
- [x] No Server Components using browser APIs (`window`, `localStorage`, etc.)
- [x] `next.config.js` includes `NODE_ENV` in env object

### 🔧 Configuration Files

- [x] `next.config.js` - Updated with NODE_ENV
- [ ] `.env.local` - All required variables set
- [ ] `.env.production` - Production variables (if used)
- [ ] `package.json` - All dependencies up to date

### 🧪 Local Testing

```bash
# 1. Clean install
npm ci

# 2. Build for production
npm run build

# 3. Run production build locally
npm run start

# 4. Test all interactive features
# - Click buttons
# - Submit forms
# - Test modals
# - Test navigation
```

- [ ] Build completes without errors
- [ ] Build completes without warnings
- [ ] Production build runs locally
- [ ] All pages load correctly
- [ ] All interactive features work
- [ ] No console errors in browser

## 🚀 Vercel Configuration

### Environment Variables

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

#### Required Variables:

- [ ] `NODE_ENV` = `production` (Production environment)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `your-supabase-url`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
- [ ] `NEXTAUTH_SECRET` = `your-secret` (if using NextAuth)
- [ ] `NEXTAUTH_URL` = `https://yourdomain.com` (if using NextAuth)

#### Optional Variables (if used):

- [ ] `STRIPE_SECRET_KEY` = `your-stripe-key`
- [ ] `STRIPE_WEBHOOK_SECRET` = `your-webhook-secret`
- [ ] `OPENAI_API_KEY` = `your-openai-key`
- [ ] `GOOGLE_CLIENT_ID` = `your-google-client-id`
- [ ] `GOOGLE_CLIENT_SECRET` = `your-google-client-secret`
- [ ] `ZOOM_CLIENT_ID` = `your-zoom-client-id`
- [ ] `ZOOM_CLIENT_SECRET` = `your-zoom-client-secret`

### Build & Development Settings

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **General**

- [ ] **Framework Preset:** Next.js
- [ ] **Build Command:** `npm run build` (or default)
- [ ] **Output Directory:** `.next` (or default)
- [ ] **Install Command:** `npm install` (or default)
- [ ] **Node.js Version:** 18.x or higher

### Domain Settings

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Domains**

- [ ] Production domain configured
- [ ] SSL certificate active
- [ ] DNS records pointing to Vercel

## 📦 Deployment Process

### Step 1: Commit Changes

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Configure NODE_ENV for production deployment"

# Push to main branch
git push origin main
```

### Step 2: Monitor Deployment

1. Go to **Vercel Dashboard** → **Deployments**
2. Watch the build progress
3. Check for any errors or warnings

### Step 3: Verify Build Logs

Look for:
- ✅ "Build completed successfully"
- ✅ No "NODE_ENV incorrectly set" warnings
- ✅ No "Event handlers cannot be passed" errors
- ✅ All pages built successfully

## 🧪 Post-Deployment Testing

### Automated Checks

- [ ] Deployment status: Success
- [ ] Build time: Reasonable (< 5 minutes)
- [ ] No build errors
- [ ] No build warnings

### Manual Testing

Visit your production site and test:

#### Public Pages
- [ ] Homepage loads
- [ ] Courses page loads
- [ ] Course detail pages load
- [ ] Pricing page loads
- [ ] About page loads
- [ ] Contact page loads
- [ ] FAQ page loads

#### Authentication
- [ ] Login page loads
- [ ] Registration page loads
- [ ] Login works
- [ ] Registration works
- [ ] Logout works
- [ ] Password reset works

#### Dashboard (Student)
- [ ] Dashboard loads
- [ ] Courses page loads
- [ ] Assignments page loads
- [ ] Grades page loads
- [ ] Profile page loads
- [ ] Settings page loads

#### Dashboard (Teacher)
- [ ] Dashboard loads
- [ ] Courses page loads
- [ ] Students page loads
- [ ] Grading page loads
- [ ] Live classes page loads
- [ ] Messages page loads

#### Dashboard (Admin)
- [ ] Dashboard loads
- [ ] Users page loads
- [ ] Courses page loads
- [ ] Reports page loads
- [ ] Settings page loads

#### Interactive Features
- [ ] Buttons respond to clicks
- [ ] Forms submit correctly
- [ ] Modals open and close
- [ ] Dropdowns work
- [ ] Search functionality works
- [ ] Filters work
- [ ] Pagination works

#### Browser Console
- [ ] No JavaScript errors
- [ ] No hydration warnings
- [ ] No "Event handlers" errors
- [ ] No "NODE_ENV" warnings

### Performance Checks

Use [PageSpeed Insights](https://pagespeed.web.dev/):

- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### SEO Checks

- [ ] Meta tags present
- [ ] Open Graph tags present
- [ ] Sitemap accessible
- [ ] Robots.txt accessible

## 🐛 Troubleshooting

### If Build Fails

1. **Check Build Logs:**
   - Look for specific error messages
   - Note which files are causing issues

2. **Common Issues:**
   - Missing environment variables
   - TypeScript errors
   - Import errors
   - Dependency issues

3. **Solutions:**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### If Deployment Succeeds But Site Doesn't Work

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Environment Variables:**
   - Verify all required vars are set in Vercel
   - Check for typos in variable names

3. **Check API Routes:**
   - Test API endpoints directly
   - Check Vercel function logs

### If You See "Event Handlers" Error

1. **Find the Component:**
   ```bash
   # Search for onClick without 'use client'
   grep -r "onClick" app --include="*.tsx" | grep -v "use client"
   ```

2. **Add 'use client':**
   ```tsx
   'use client' // Add this at the top
   
   export default function MyComponent() {
     // ... rest of component
   }
   ```

### If You See "NODE_ENV" Warning

1. **Check next.config.js:**
   ```javascript
   env: {
     NODE_ENV: process.env.NODE_ENV || 'production',
   }
   ```

2. **Check Vercel Environment Variables:**
   - Ensure `NODE_ENV=production` is set

3. **Redeploy:**
   - Clear build cache
   - Trigger new deployment

## 📊 Monitoring

### After Deployment

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Vercel Analytics
- [ ] Check Vercel Function logs regularly
- [ ] Set up uptime monitoring
- [ ] Monitor performance metrics

### Regular Checks

- **Daily:** Check error logs
- **Weekly:** Review performance metrics
- **Monthly:** Review and update dependencies

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ All interactive features work
- ✅ No console errors
- ✅ Performance scores are good
- ✅ SEO is properly configured
- ✅ All user flows work end-to-end

## 📚 Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Ready to Deploy?** Follow this checklist step by step for a smooth deployment! 🚀
