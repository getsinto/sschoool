# Design Document

## Overview

This design addresses critical production errors in Supabase authentication and database queries across all API routes. The solution implements consistent patterns for client initialization, authentication guards, and safe query methods that handle edge cases gracefully.

## Architecture

### Client Initialization Pattern

All API routes will follow this pattern:

```typescript
const supabase = await createClient(); // MUST await
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Query Safety Pattern

Replace unsafe `.single()` with `.maybeSingle()`:

```typescript
// UNSAFE - throws PGRST116 if no results
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .single();

// SAFE - returns null if no results
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (!data) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

## Components and Interfaces

### Auth Guard Utility

Create a reusable auth guard function:

```typescript
// lib/api/auth-guard.ts
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Auth error:', error);
    return { user: null, error: 'Authentication failed' };
  }
  
  if (!user) {
    return { user: null, error: 'Unauthorized' };
  }
  
  return { user, error: null };
}
```

### Safe Query Utilities

```typescript
// lib/api/safe-queries.ts
export async function findOne<T>(
  query: PostgrestFilterBuilder<any, any, T[]>
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const { data, error } = await query.maybeSingle();
  return { data, error };
}

export async function requireOne<T>(
  query: PostgrestFilterBuilder<any, any, T[]>,
  notFoundMessage = 'Resource not found'
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Query error:', error);
    return { data: null, error: 'Database error', status: 500 };
  }
  
  if (!data) {
    return { data: null, error: notFoundMessage, status: 404 };
  }
  
  return { data, error: null, status: 200 };
}
```

## Data Models

No changes to database schema required. This is purely an application-layer fix.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Client Initialization Safety
*For any* API route handler, awaiting createClient() should never throw an undefined error when accessing auth methods.
**Validates: Requirements 1.1, 1.2**

### Property 2: Auth Guard Completeness
*For any* authenticated API route, checking both authError and user existence should prevent all "Cannot read properties of undefined" errors.
**Validates: Requirements 2.1, 2.2, 2.4**

### Property 3: Query Result Handling
*For any* database query using maybeSingle(), a null result should be handled without throwing exceptions.
**Validates: Requirements 3.1, 3.2**

### Property 4: PGRST116 Error Prevention
*For any* query that may return zero results, using maybeSingle() instead of single() should eliminate PGRST116 errors.
**Validates: Requirements 3.1, 3.4**

### Property 5: Role Query Safety
*For any* role-based query, using maybeSingle() should handle missing role records without crashing.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Error Response Consistency
*For any* API error, the response should include appropriate HTTP status codes and not expose sensitive details.
**Validates: Requirements 5.2, 5.3, 5.5**

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   - Missing or invalid auth token
   - Expired session
   - User not found

2. **Authorization Errors (403)**
   - User lacks required role
   - User doesn't own the resource
   - Permission denied

3. **Not Found Errors (404)**
   - Resource doesn't exist
   - Query returned no results

4. **Client Errors (400)**
   - Invalid request body
   - Missing required fields
   - Validation failures

5. **Server Errors (500)**
   - Database connection failures
   - Unexpected exceptions
   - Third-party service errors

### Error Response Format

```typescript
{
  error: string;  // User-friendly message
  details?: string; // Optional details (dev mode only)
  code?: string;  // Optional error code
}
```

## Testing Strategy

### Unit Tests

Test individual utility functions:
- Auth guard with various user states
- Safe query functions with different result sets
- Error response formatting

### Integration Tests

Test complete API routes:
- Unauthenticated requests
- Authenticated requests
- Queries with no results
- Queries with multiple results
- Database errors

### Production Testing

1. Build production bundle: `npm run build`
2. Start production server: `npm start`
3. Test scenarios:
   - Call API without auth token
   - Call API with valid auth
   - Query non-existent resources
   - Query with missing role records

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. Fix `/api/notifications` routes (main error source)
2. Add await to all createClient() calls
3. Replace single() with maybeSingle() in critical paths

### Phase 2: Systematic Fixes (Next)
1. Audit all API routes for missing await
2. Replace all unsafe single() calls
3. Add consistent error handling

### Phase 3: Utilities & Testing (Final)
1. Create reusable auth guard
2. Create safe query utilities
3. Add comprehensive tests
4. Document patterns for future development
