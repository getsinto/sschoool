# Vercel CORS Error Fix Guide

## Problem
Getting `Failed to fetch` and CORS error when trying to login on deployed Vercel app:
```
Access to fetch at 'https://lbgtvxqlpjsswybbhfxy.supabase.co/auth/v1/token?grant_type=password' 
from origin 'https://sthsc.vercel.app' has been blocked by CORS policy
```

## Root Cause
Supabase project is not configured to accept requests from your Vercel domain.

---

## Fix Steps

### 1. Configure Supabase Dashboard

Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lbgtvxqlpjsswybbhfxy

#### A. Update Site URL and Redirect URLs

1. Navigate to **Settings** → **API**
2. Scroll to **Configuration** section
3. Update the following fields:

**Site URL:**
```
https://sthsc.vercel.app
```

**Additional Redirect URLs** (add all these):
```
https://sthsc.vercel.app
https://sthsc.vercel.app/auth/callback
https://sthsc.vercel.app/api/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

4. Click **Save**

#### B. Update Authentication Settings

1. Navigate to **Authentication** → **URL Configuration**
2. Update these fields:

**Site URL:**
```
https://sthsc.vercel.app
```

**Redirect URLs** (add all these):
```
https://sthsc.vercel.app/**
http://localhost:3000/**
```

3. Click **Save**

---

### 2. Verify Vercel Environment Variables

Go to your Vercel Dashboard: https://vercel.com/dashboard

1. Select your project (`sthsc`)
2. Go to **Settings** → **Environment Variables**
3. Verify these variables are set correctly:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lbgtvxqlpjsswybbhfxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Make sure these are set for **Production**, **Preview**, and **Development** environments.

---

### 3. Get Your Supabase Keys

If you need to find your Supabase keys:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lbgtvxqlpjsswybbhfxy
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

### 4. Redeploy Vercel App

After updating Supabase settings and verifying environment variables:

**Option A: Trigger Redeploy from Vercel Dashboard**
1. Go to your Vercel project
2. Click **Deployments** tab
3. Click the three dots on the latest deployment
4. Click **Redeploy**

**Option B: Push a commit to trigger deployment**
```bash
git commit --allow-empty -m "Trigger redeploy after Supabase CORS fix"
git push origin main
```

---

### 5. Test the Login

1. Wait for deployment to complete
2. Visit: https://sthsc.vercel.app
3. Try to login
4. Check browser console for any errors

---

## Additional Troubleshooting

### If CORS error persists:

1. **Clear browser cache** and try again
2. **Check Supabase logs:**
   - Go to Supabase Dashboard → **Logs** → **Auth Logs**
   - Look for failed authentication attempts

3. **Verify CORS headers in Supabase:**
   - Go to **Settings** → **API** → **CORS**
   - Make sure `https://sthsc.vercel.app` is allowed

4. **Check if Supabase is down:**
   - Visit: https://status.supabase.com/

### If you get "Invalid API key" error:

1. Regenerate your Supabase keys:
   - Go to **Settings** → **API**
   - Click **Reset** on the anon key (if needed)
2. Update the keys in Vercel environment variables
3. Redeploy

---

## Quick Checklist

- [ ] Updated Site URL in Supabase API settings
- [ ] Added redirect URLs in Supabase API settings
- [ ] Updated Authentication URL Configuration in Supabase
- [ ] Verified all environment variables in Vercel
- [ ] Redeployed Vercel app
- [ ] Tested login on production URL
- [ ] Checked browser console for errors

---

## Expected Result

After completing these steps, you should be able to:
- ✅ Visit https://sthsc.vercel.app
- ✅ Click login/register
- ✅ Successfully authenticate without CORS errors
- ✅ Be redirected to the appropriate dashboard

---

## Need More Help?

If the issue persists after following all steps:

1. Check the browser console for the exact error message
2. Check Supabase Auth logs for failed attempts
3. Verify your Supabase project is on a paid plan (if using custom domains)
4. Contact Supabase support if the issue is on their end

---

**Note:** Changes to Supabase settings may take 1-2 minutes to propagate. If it doesn't work immediately, wait a moment and try again.
