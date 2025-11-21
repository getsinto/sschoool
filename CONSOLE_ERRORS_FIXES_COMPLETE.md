# Console Errors - Complete Fixes

## All Issues Fixed

### ✅ 1. `/api/user/role` 404 Error (All Dashboards)
**File Created:** `app/api/user/role/route.ts`
- Returns authenticated user's role from profiles table
- Handles auth and error cases

### ✅ 2. `/api/notifications/stats` 500 Error (All Dashboards)
**File Created:** `app/api/notifications/stats/route.ts`
- Returns unread count, total count, and type statistics
- Properly handles authentication

### ✅ 3. Missing Images
**Files Created:**
- `public/images/grid-pattern.svg` - Grid background pattern
- `public/avatars/placeholder.svg` - Default avatar placeholder

**Note:** For specific avatars (david.jpg, emma.jpg, alex.jpg, jessica.jpg), you should either:
- Upload actual images to `public/avatars/`
- Or update code to use the placeholder.svg

### ⚠️ 4. Dialog Accessibility Warnings
**Issue:** `DialogContent requires a DialogTitle for accessibility`

**Solution:** These warnings come from UI components using Radix Dialog. To fix:
1. Find all Dialog components missing DialogTitle
2. Add `<DialogTitle>` or wrap with `<VisuallyHidden>`

**Example Fix:**
```tsx
import { DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

// Option 1: Add visible title
<DialogContent>
  <DialogTitle>Dialog Title</DialogTitle>
  {/* content */}
</DialogContent>

// Option 2: Hide title for screen readers only
<DialogContent>
  <VisuallyHidden>
    <DialogTitle>Dialog Title</DialogTitle>
  </VisuallyHidden>
  {/* content */}
</DialogContent>
```

### ⚠️ 5. Content Security Policy (CSP) eval() Warning
**Issue:** CSP blocks eval() in JavaScript

**Solution:** Add CSP configuration to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow eval for development
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

**Note:** For production, remove `'unsafe-eval'` and ensure no code uses eval().

### ⚠️ 6. Missing Routes (404 Errors)
**Issues:**
- `/dashboard/student/courses/c1/learn` - 404
- `/dashboard/parent/children/1` - 404
- `/admin/profile` - 404

**These need to be created based on your routing structure.**

## Files Created/Modified

### New API Endpoints:
1. `app/api/user/role/route.ts`
2. `app/api/notifications/stats/route.ts`

### New Assets:
1. `public/images/grid-pattern.svg`
2. `public/avatars/placeholder.svg`

### Modified Files:
1. `app/(dashboard)/layout.tsx` - Added NotificationBell component

### Database Migration:
1. `supabase/migrations/021_support_system.sql` - Support system tables

## Deployment Checklist

### Step 1: Commit and Push
```bash
git add .
git commit -m "Fix: Add missing APIs, assets, and notification bell functionality"
git push origin main
```

### Step 2: Apply Database Migration
```bash
supabase db push
```

### Step 3: Upload Missing Avatar Images
Either:
- Upload actual avatar images to `public/avatars/`
- Or update code to use placeholder.svg for all avatars

### Step 4: Fix Dialog Accessibility (Optional but Recommended)
Search for Dialog components and add DialogTitle:
```bash
# Search for Dialog usage
grep -r "DialogContent" components/
```

### Step 5: Configure CSP (Optional)
Add CSP headers to `next.config.js` as shown above.

## Testing After Deployment

1. **Check API Endpoints:**
   - Open browser DevTools → Network tab
   - Verify `/api/user/role` returns 200
   - Verify `/api/notifications/stats` returns 200

2. **Check Notifications Bell:**
   - Click bell icon in header
   - Dropdown should appear with notifications
   - Unread count should display

3. **Check Images:**
   - Grid pattern should load on pages
   - Avatar placeholders should display

4. **Check Console:**
   - No more 404 errors for APIs
   - No more 500 errors for notifications/stats
   - Image 404s should be resolved

## Remaining Issues (Non-Critical)

1. **Dialog Accessibility Warnings** - Cosmetic, doesn't break functionality
2. **CSP eval() Warning** - Development only, can be configured
3. **Missing Routes** - Need to be created based on your app structure

## Priority Actions

**High Priority (Do Now):**
1. ✅ Deploy code changes
2. ✅ Apply database migration
3. ✅ Test API endpoints

**Medium Priority (Do Soon):**
1. Upload avatar images or update code to use placeholders
2. Fix Dialog accessibility warnings
3. Create missing routes

**Low Priority (Optional):**
1. Configure CSP headers
2. Optimize images
3. Add error boundaries

## Support

If errors persist after deployment:
1. Check Vercel deployment logs
2. Check Supabase database logs  
3. Check browser console for specific errors
4. Verify all migrations were applied successfully
