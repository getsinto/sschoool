# Vercel Deployment Fixes - Critical

## Issues Found

### 1. API Routes Using Cookies During Static Generation
**Problem**: Many API routes are being called during build time and trying to access cookies, which causes "Dynamic server usage" errors.

**Affected Routes**:
- `/api/admin/audit-logs`
- `/api/admin/courses/assignments`
- `/api/admin/monitoring/*`
- `/api/admin/pricing-analytics`
- `/api/admin/subjects/requests`
- `/api/admin/verification/pending`
- `/api/seo/sitemap.xml`

**Solution**: Add `export const dynamic = 'force-dynamic'` to these API routes

### 2. 404 Page Timeout
**Problem**: The not-found page is timing out during static generation after 3 attempts.

**Solution**: Make it a dynamic page or simplify it

### 3. Event Handlers in Client Components
**Problem**: onClick handlers being passed incorrectly to client components

**Solution**: Ensure proper 'use client' directives

## Fixes to Apply

### Fix 1: Add Dynamic Export to API Routes

Add this line to the top of each affected API route file:

```typescript
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

### Fix 2: Update not-found.tsx

Make it explicitly dynamic or add proper error boundaries.

### Fix 3: Update next.config.js

Add proper configuration for static/dynamic pages.

## Files to Update

1. `app/api/admin/audit-logs/route.ts`
2. `app/api/admin/courses/assignments/route.ts`
3. `app/api/admin/monitoring/course-permissions/route.ts`
4. `app/api/admin/monitoring/metrics/route.ts`
5. `app/api/admin/pricing-analytics/route.ts`
6. `app/api/admin/subjects/requests/route.ts`
7. `app/api/admin/verification/pending/route.ts`
8. `app/api/seo/sitemap.xml/route.ts`
9. `app/not-found.tsx`
10. `next.config.js`

## Priority

**CRITICAL** - Blocks deployment

