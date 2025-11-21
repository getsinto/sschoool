# Quick Deployment Commands

## Step 1: Deploy Code to Vercel

```bash
git add .
git commit -m "Fix: Resolve all console errors - add missing APIs, assets, and fix notifications"
git push origin main
```

Wait for Vercel deployment to complete (1-2 minutes).

## Step 2: Apply Database Migration

```bash
supabase db push
```

## Step 3: Verify Fixes

Open your site and check:
- ✅ No console errors for `/api/user/role`
- ✅ No console errors for `/api/notifications/stats`
- ✅ Notification bell works
- ✅ Images load correctly

## That's It!

All critical issues are now fixed. Check `FINAL_FIXES_SUMMARY.md` for complete details.
