# Design Document

## Overview

This design addresses critical authentication and database query issues in API routes that cause production errors in Vercel. The solution focuses on proper async/await handling for Supabase client initialization and replacing `.single()` with `.maybeSingle()` for safer query patterns.

## Architecture

### Current Issues

1. **Async Client Creation Not Awaited**: Routes call `createClient()` without await, causing `supabase.auth` to be undefined
2. **Unsafe .single() Usage**: Queries use `.single()` which throws PGRST116 errors when no rows exist
3. **Inconsistent Error Handling**: Some routes don't properly handle missing users or data

### Proposed Solution

```
┌─────────────────┐
│  API Route      │
│  Handler        │
└────────┬────────┘
         │
         ├─ await createClient()
         │  (with cookies context)
         │
         ├─ await supabase.auth.getUser()
         │  (check for errors & null user)
         │
         ├─ Query with .maybeSingle()
         │  (handle null results)
         │
         └─ Return appropriate response
            (200, 401, 404, 500)
```

## Components and Interfaces

### 1. Supabase Client Initialization Pattern

```typescript
// CORRECT Pattern
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient() // ✅ AWAIT
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Continue with authenticated logic
  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// INCORRECT Pattern (causes production errors)
export async function GET(request: NextRequest) {
  const supabase = createClient() // ❌ Missing await
  const { data: { user } } = await supabase.auth.getUser() // ❌ supabase.auth is undefined
}
```

### 2. Safe Query Pattern

```typescript
// CORRECT Pattern - Use maybeSingle() for optional records
const { data: profile, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .maybeSingle() // ✅ Returns null if not found

if (error) {
  console.error('Query error:', error)
  return NextResponse.json({ error: 'Database error' }, { status: 500 })
}

if (!profile) {
  return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
}

// INCORRECT Pattern (throws PGRST116)
const { data: profile, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single() // ❌ Throws error if 0 rows
```

### 3. Guest Access Pattern (for chatbot)

```typescript
// Allow both authenticated and guest users
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Don't fail on auth error for guest access
    const isGuest = !user || authError
    
    // Process request with optional user context
    const userContext = {
      userId: user?.id || null,
      userRole: isGuest ? 'guest' : 'authenticated',
      userEmail: user?.email || null
    }
    
    // Continue processing...
  } catch (error) {
    // Handle errors
  }
}
```

## Data Models

No database schema changes required. This is purely a code-level fix.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Client initialization is always awaited

*For any* API route handler that uses createClient(), the function call must be awaited before accessing any supabase properties
**Validates: Requirements 1.1**

### Property 2: Auth errors are handled gracefully

*For any* API route that calls supabase.auth.getUser(), both authError and null user cases must be handled before proceeding
**Validates: Requirements 1.3, 1.4**

### Property 3: Optional queries use maybeSingle

*For any* database query where zero results is a valid outcome, the query must use .maybeSingle() instead of .single()
**Validates: Requirements 2.1, 2.2**

### Property 4: Query results are null-checked

*For any* query using .maybeSingle(), the code must check if data is null before accessing properties
**Validates: Requirements 2.4**

### Property 5: Error responses include status codes

*For any* error condition, the API must return an appropriate HTTP status code (401, 404, 500)
**Validates: Requirements 3.3**

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   - Missing or invalid auth token
   - Expired session
   - User not found in auth system

2. **Not Found Errors (404)**
   - Record doesn't exist in database
   - Resource ID is invalid

3. **Database Errors (500)**
   - Query execution failures
   - Connection issues
   - RLS policy violations

4. **Validation Errors (400)**
   - Missing required fields
   - Invalid input format

### Error Response Format

```typescript
{
  error: string,           // Human-readable error message
  code?: string,          // Optional error code for client handling
  details?: any           // Optional additional context (dev mode only)
}
```

## Testing Strategy

### Unit Tests

- Test createClient() is awaited in all routes
- Test auth.getUser() error handling
- Test .maybeSingle() null handling
- Test error response formats

### Integration Tests

- Test authenticated user flows
- Test unauthenticated/guest flows
- Test missing record scenarios
- Test database error scenarios

### Manual Testing

1. **Local Production Build**
   ```bash
   npm run build
   npm start
   ```
   - Test chatbot as guest
   - Test chatbot as authenticated user
   - Test notifications API
   - Test user role API

2. **Vercel Production**
   - Deploy changes
   - Monitor error logs
   - Test all three previously failing endpoints
   - Verify no new errors introduced

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. Fix chatbot message API (app/api/chatbot/message/route.ts)
2. Fix notifications API (app/api/notifications/route.ts)
3. Fix user role API (app/api/user/role/route.ts)

### Phase 2: Systematic Audit (Next)
4. Audit all API routes for missing await on createClient()
5. Replace all .single() with .maybeSingle() where appropriate
6. Add consistent error handling

### Phase 3: Verification (Final)
7. Test locally in production mode
8. Deploy to Vercel
9. Monitor production logs
10. Verify all three errors are resolved
