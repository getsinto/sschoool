# API Authentication Fixes Summary

## Critical Issues Fixed

### 1. Missing `await` on `createClient()`

**Problem**: Routes were calling `createClient()` without `await`, causing `supabase.auth` to be undefined in production.

**Files Fixed**:
- ✅ app/api/chatbot/message/route.ts
- ✅ app/api/notifications/route.ts
- ✅ app/api/zoom/generate-signature/route.ts
- ✅ app/api/zoom/create-meeting/route.ts
- ✅ app/api/zoom/update-meeting/[id]/route.ts
- ✅ app/api/zoom/recordings/[meetingId]/route.ts
- ✅ app/api/zoom/participants/[meetingId]/route.ts
- ✅ app/api/zoom/recording/start/[meetingId]/route.ts
- ✅ app/api/zoom/recording/stop/[meetingId]/route.ts
- ✅ app/api/zoom/meeting/[id]/route.ts
- ✅ app/api/zoom/delete-meeting/[id]/route.ts
- ✅ app/api/zoom/attendance/[meetingId]/route.ts
- ✅ app/api/webhooks/zoom/route.ts
- ✅ app/api/webhooks/stripe/route.ts
- ✅ app/api/test-supabase/route.ts
- ✅ app/api/user/profile/route.ts
- ✅ app/api/teacher/subjects/route.ts
- ✅ app/api/teacher/subjects/custom/route.ts
- ✅ app/api/support/tickets/route.ts
- ✅ app/api/support/tickets/[id]/route.ts
- ✅ app/api/support/tickets/[id]/survey/route.ts
- ✅ app/api/support/tickets/[id]/attachments/route.ts
- ✅ app/api/support/tickets/[id]/close/route.ts
- ✅ app/api/support/tickets/[id]/reply/route.ts
- ✅ app/api/teacher/live-classes/route.ts
- ✅ app/api/teacher/live-classes/[id]/route.ts
- ✅ app/api/teacher/live-classes/[id]/start/route.ts
- ✅ app/api/teacher/courses/create/route.ts
- ✅ app/api/teacher/courses/[id]/batches/route.ts
- ✅ app/api/teacher/courses/[id]/batches/[batchId]/route.ts

### 2. Unsafe `.single()` Usage

**Problem**: Using `.single()` throws PGRST116 error when no rows exist. Should use `.maybeSingle()` instead.

**Files Fixed**:
- ✅ app/api/user/role/route.ts - Changed to `.maybeSingle()` with null check

**Files Still Using `.single()` (Need Review)**:
These files use `.single()` but may be intentional (expecting record to exist):
- app/api/zoom/update-meeting/[id]/route.ts (line 22)
- app/api/zoom/recording/stop/[meetingId]/route.ts (line 22)
- app/api/zoom/recording/start/[meetingId]/route.ts (line 22)
- app/api/zoom/participants/[meetingId]/route.ts (line 22)
- app/api/zoom/meeting/[id]/route.ts (line 27)
- app/api/zoom/delete-meeting/[id]/route.ts (line 22)
- app/api/zoom/attendance/[meetingId]/route.ts (line 22)
- app/api/user/profile/route.ts (lines 25, 44, 51, 58)
- app/api/teacher/subjects/route.ts (line 62)
- app/api/teacher/subjects/custom/route.ts (line 65)
- app/api/teacher/live-classes/route.ts (lines 139, 245)
- app/api/teacher/live-classes/[id]/route.ts (lines 29, 47, 115, 178, 243)
- app/api/teacher/live-classes/[id]/start/route.ts (line 25)

**Recommendation**: These should be reviewed case-by-case. If the record MUST exist for the operation to proceed, `.single()` is appropriate. Otherwise, use `.maybeSingle()` with proper null handling.

## Pattern Changes

### Before (Incorrect)
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient() // ❌ Missing await
    const { data: { user } } = await supabase.auth.getUser() // ❌ supabase.auth is undefined
```

### After (Correct)
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() // ✅ Awaited
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
```

### Query Pattern Change

**Before (Throws error on no rows)**:
```typescript
const { data: userData, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single() // ❌ Throws PGRST116 if no rows

if (error) {
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

**After (Handles missing records)**:
```typescript
const { data: userData, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .maybeSingle() // ✅ Returns null if no rows

if (error) {
  return NextResponse.json({ error: 'Database error' }, { status: 500 })
}

if (!userData) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 })
}
```

## Testing Instructions

### Local Production Build
```bash
npm run build
npm start
```

Test these endpoints:
1. `/api/chatbot/message` - POST with and without auth
2. `/api/notifications` - GET with auth
3. `/api/user/role` - GET with auth

### Vercel Deployment
1. Commit and push changes
2. Monitor Vercel build logs
3. Check production error logs for the three original errors:
   - TypeError: Cannot read properties of undefined (reading 'getUser')
   - PGRST116 error
   - Notifications API auth error

## Next Steps

1. ✅ Fix critical routes (chatbot, notifications, user role)
2. ✅ Audit and fix all createClient() calls
3. ⚠️ Review remaining .single() usage (case-by-case)
4. 🔄 Test locally in production mode
5. 🔄 Deploy to Vercel and verify fixes

## Files Requiring Manual Review

The following files use `.single()` and should be reviewed to determine if `.maybeSingle()` is more appropriate:

1. **Zoom API routes** - Profile checks for teacher/admin role
2. **User profile route** - Multiple role-specific profile queries
3. **Teacher subjects** - Subject insertion
4. **Live classes** - Class and enrollment queries

For each, determine:
- Should the record always exist? → Keep `.single()`
- Could the record be missing? → Change to `.maybeSingle()` + null check
