# Supabase Auth Fixes - Testing Guide

## What Was Fixed

✅ **Critical `/api/notifications` routes** - No more 500 errors
✅ **Missing await on createClient()** - Fixed "Cannot read properties of undefined"
✅ **PGRST116 errors** - Replaced `.single()` with `.maybeSingle()`
✅ **Auth guards** - Proper null checks for unauthenticated users
✅ **Error logging** - All errors now logged for debugging

## Local Testing (Production Mode)

### 1. Build and Start Production Server
```bash
npm run build
npm start
```

### 2. Test Unauthenticated Requests
```bash
# Should return 401 Unauthorized
curl http://localhost:3000/api/notifications

# Should return 401 Unauthorized
curl http://localhost:3000/api/notifications/stats
```

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code:** 401

### 3. Test Authenticated Requests

First, get an auth token from your browser:
1. Open DevTools → Application → Cookies
2. Copy the `sb-access-token` value

```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/stats
```

**Expected Response:**
```json
{
  "notifications": [...],
  "unreadCount": 0,
  "totalCount": 0
}
```

**Status Code:** 200

### 4. Test Not Found Cases
```bash
# Should return 404 Not Found
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/00000000-0000-0000-0000-000000000000
```

**Expected Response:**
```json
{
  "error": "Notification not found"
}
```

**Status Code:** 404

## Vercel Production Testing

### 1. Check Deployment Status
Visit: https://vercel.com/your-project/deployments

Wait for deployment to complete (usually 2-3 minutes)

### 2. Test Production Endpoints
```bash
# Replace with your actual Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test unauthenticated (should return 401)
curl $VERCEL_URL/api/notifications

# Test with auth token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  $VERCEL_URL/api/notifications
```

### 3. Monitor Vercel Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `/api/notifications`
3. View real-time logs

**Look for:**
- ✅ No "Cannot read properties of undefined" errors
- ✅ No "PGRST116" errors
- ✅ Proper error logs with `console.error()`
- ✅ 401/404/500 status codes as appropriate

## Common Issues & Solutions

### Issue: Still getting 500 errors

**Check:**
1. Is `createClient()` awaited? → `const supabase = await createClient()`
2. Is auth guard complete? → Check both `authError` and `!user`
3. Is `.maybeSingle()` used? → Not `.single()`
4. Are null checks present? → After `.maybeSingle()` calls

**Solution:**
```typescript
// ✅ Correct pattern
const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  console.error('Auth error:', authError);
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (error) {
  console.error('Database error:', error);
  return NextResponse.json({ error: 'Database error' }, { status: 500 });
}

if (!data) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Issue: PGRST116 errors still occurring

**Cause:** Using `.single()` instead of `.maybeSingle()`

**Solution:**
```typescript
// ❌ Wrong
.single()

// ✅ Correct
.maybeSingle()

// Then add null check
if (!data) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Issue: "Cannot read properties of undefined"

**Cause:** Not awaiting `createClient()` or not checking for null user

**Solution:**
```typescript
// ❌ Wrong
const supabase = createClient(); // Missing await

// ✅ Correct
const supabase = await createClient();

// ❌ Wrong
const { data: { user } } = await supabase.auth.getUser(); // No error check

// ✅ Correct
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Using the New Utilities

### Auth Guard
```typescript
import { requireAuth } from '@/lib/api/auth-guard';

const supabase = await createClient();
const { user, error } = await requireAuth(supabase);

if (error || !user) {
  return NextResponse.json({ error }, { status: 401 });
}
```

### Safe Queries
```typescript
import { requireOne } from '@/lib/api/safe-queries';

const query = supabase
  .from('notifications')
  .select('*')
  .eq('id', id);

const { data, error, status } = await requireOne(query, 'Notification not found');

if (error) {
  return NextResponse.json({ error }, { status });
}

return NextResponse.json(data);
```

## Next Steps

After verifying these fixes work:

1. **Phase 2:** Fix remaining API routes with same patterns
2. **Monitor:** Watch Vercel logs for any remaining errors
3. **Document:** Update team docs with these patterns
4. **Prevent:** Add linting rules to catch these issues

## Success Criteria

✅ No 500 errors on `/api/notifications` routes
✅ Proper 401 responses for unauthenticated requests
✅ Proper 404 responses for not found resources
✅ Error logs visible in Vercel function logs
✅ No "Cannot read properties of undefined" errors
✅ No PGRST116 errors

## Support

If issues persist:
1. Check Vercel function logs for specific errors
2. Review `SUPABASE_AUTH_FIXES_COMPLETE.md` for patterns
3. Check spec: `.kiro/specs/supabase-auth-fixes-dec-2025/`
4. Use utilities in `lib/api/` for consistent patterns
