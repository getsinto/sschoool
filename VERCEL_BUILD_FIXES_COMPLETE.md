# Vercel Build Fixes - Complete Guide

## Issue 1: Dynamic Server Usage - FIXED

All API routes now have `export const dynamic = 'force-dynamic'` added.

### Files Fixed:
- All routes in `app/api/**/*.ts` that use cookies, request.url, or searchParams

## Issue 2: Missing Suspense Boundaries - TO FIX

Pages using `useSearchParams()` need Suspense boundaries:

### Files to Fix:
1. `app/auth/login/page.tsx`
2. `app/(public)/checkout/payment/page.tsx`
3. `app/(auth)/verify-email/page.tsx`
4. `app/(auth)/reset-password/page.tsx`

### Solution Pattern:
```tsx
// Create a client component for the logic
'use client'
import { useSearchParams } from 'next/navigation'

export function LoginForm() {
  const searchParams = useSearchParams()
  // ... rest of logic
}

// In the main page (server component)
import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
```

## Issue 3: Unsupported Server Component Props - TO FIX

Server components cannot pass non-serializable props (functions, component instances, etc.)

### Common Issues:
- Passing functions as props
- Passing component instances
- Passing class instances
- Passing symbols

### Solution:
- Move client-side logic to client components
- Pass only plain objects, strings, numbers, arrays
- Use 'use client' directive for components that need interactivity

## Implementation Status

✅ Added `export const dynamic = 'force-dynamic'` to all API routes
⏳ Suspense boundaries for useSearchParams pages
⏳ Server component serialization fixes
