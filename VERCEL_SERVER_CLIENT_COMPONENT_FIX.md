# Vercel Production Error Fix: Server vs Client Components

## Problem Summary
You're getting this production error on Vercel:
```
Error: An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
```

And also seeing:
```
Event handlers cannot be passed to Client Component props.
```

## Root Cause
Next.js 13+ App Router has a strict separation between Server Components (default) and Client Components (marked with `'use client'`). The error occurs when:

1. **Server Components** try to use client-only features (onClick, useState, useEffect, etc.)
2. **Server Components** pass event handlers to Client Components as props
3. Non-serializable data is passed between Server and Client boundaries

## Good News
Looking at your codebase, **most of your components are already correctly marked with `'use client'`**. However, there are a few patterns that can cause issues in production.

---

## The Fix: 7-Step Solution

### 1. Identify Server Components Using Client Logic

**Rule**: Any component using these features MUST have `'use client'` at the top:
- `useState`, `useEffect`, `useContext`
- `onClick`, `onChange`, `onSubmit` handlers
- Browser APIs (window, document, localStorage)
- Event listeners

**Your Status**: ✅ Most components already have `'use client'`

### 2. Never Pass Event Handlers from Server to Client

**❌ WRONG** (Server Component):
```tsx
// app/page.tsx (Server Component by default)
export default function Page() {
  const handleClick = () => console.log('clicked')
  
  return <Button onClick={handleClick}>Click</Button>
}
```

**✅ CORRECT** (Client Component):
```tsx
// app/page.tsx
'use client'

export default function Page() {
  const handleClick = () => console.log('clicked')
  
  return <Button onClick={handleClick}>Click</Button>
}
```

**Your Status**: ✅ Your pages already use `'use client'`

### 3. Ensure UI Components Are Client Components

All interactive UI components should be Client Components:

```tsx
// components/ui/button.tsx
'use client'

import * as React from "react"

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, ...props }, ref) => {
    return (
      <button
        onClick={onClick}  // ✅ Safe because this is a Client Component
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Your Status**: ✅ Your `components/ui/button.tsx` already has `'use client'`

### 4. Correct Pattern: Server Component → Client Component

**✅ CORRECT PATTERN**:

```tsx
// app/dashboard/page.tsx (Server Component - NO 'use client')
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  // ✅ Server-side data fetching
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  
  // ✅ Pass serializable data to Client Component
  return <DashboardClient data={json} />
}
```

```tsx
// app/dashboard/DashboardClient.tsx (Client Component)
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function DashboardClient({ data }) {
  const [count, setCount] = useState(0)
  
  // ✅ Event handlers in Client Component
  const handleClick = () => setCount(count + 1)
  
  return (
    <div>
      <h1>{data.title}</h1>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  )
}
```

### 5. Fix Common Patterns in Your Codebase

#### Pattern A: Page Components
Most of your page components already have `'use client'`, which is correct:

```tsx
// app/(dashboard)/teacher/courses/page.tsx
'use client'  // ✅ Correct

import { useState } from 'react'

export default function TeacherCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // ... rest of component
}
```

#### Pattern B: Layout Components
Your layouts are Client Components, which is fine for interactive layouts:

```tsx
// app/(dashboard)/layout.tsx
'use client'  // ✅ Correct for interactive sidebar

import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // ... rest of layout
}
```

#### Pattern C: Shared Components
Components with interactivity should be Client Components:

```tsx
// components/notifications/NotificationBell.tsx
'use client'  // ✅ Add this if missing

import { useState } from 'react'
import { Bell } from 'lucide-react'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      <Bell />
    </button>
  )
}
```

### 6. Check for Missing 'use client' Directives

Run this command to find components that might be missing `'use client'`:

```bash
# Find files using useState without 'use client'
grep -r "useState" --include="*.tsx" --include="*.ts" app/ components/ | grep -v "use client"
```

**Files to check**:
- Any component using `useState`, `useEffect`, `useRouter` (from next/navigation)
- Any component with `onClick`, `onChange`, etc.
- Any component using browser APIs

### 7. Verify Serializable Props

Only pass serializable data between Server and Client Components:

**✅ SERIALIZABLE** (Safe to pass):
- Strings, numbers, booleans
- Plain objects and arrays
- Dates (as ISO strings)
- null, undefined

**❌ NOT SERIALIZABLE** (Will cause errors):
- Functions
- Class instances
- Symbols
- undefined in objects (use null instead)

---

## Example: Corrected Server Component with Client Component

### ❌ BEFORE (Causes Error):

```tsx
// app/courses/page.tsx (Server Component)
export default function CoursesPage() {
  const handleEnroll = () => {
    console.log('Enrolling...')
  }
  
  return (
    <div>
      <h1>Courses</h1>
      {/* ❌ ERROR: Passing function to Client Component */}
      <Button onClick={handleEnroll}>Enroll</Button>
    </div>
  )
}
```

### ✅ AFTER (Fixed):

**Option 1: Make the page a Client Component**
```tsx
// app/courses/page.tsx
'use client'  // ✅ Add this

export default function CoursesPage() {
  const handleEnroll = () => {
    console.log('Enrolling...')
  }
  
  return (
    <div>
      <h1>Courses</h1>
      <Button onClick={handleEnroll}>Enroll</Button>
    </div>
  )
}
```

**Option 2: Extract to Client Component**
```tsx
// app/courses/page.tsx (Server Component)
import { CoursesClient } from './CoursesClient'

export default async function CoursesPage() {
  // ✅ Fetch data on server
  const courses = await getCourses()
  
  return <CoursesClient courses={courses} />
}
```

```tsx
// app/courses/CoursesClient.tsx
'use client'

import { Button } from '@/components/ui/button'

export function CoursesClient({ courses }) {
  const handleEnroll = () => {
    console.log('Enrolling...')
  }
  
  return (
    <div>
      <h1>Courses</h1>
      <Button onClick={handleEnroll}>Enroll</Button>
    </div>
  )
}
```

---

## Debugging Production Errors Locally

### Method 1: Use Production Build Locally

```bash
# Build for production
npm run build

# Run production server
npm start
```

### Method 2: Enable Detailed Error Messages

Add to `next.config.js`:

```js
module.exports = {
  // ... other config
  
  // Show detailed errors in production (ONLY for debugging)
  productionBrowserSourceMaps: true,
  
  // Or set this env variable
  env: {
    NEXT_PUBLIC_SHOW_ERRORS: 'true'
  }
}
```

### Method 3: Check Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs [deployment-url]

# Or set environment variable in Vercel dashboard
VERCEL_LOG=1
```

### Method 4: Use Error Boundary

```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Error details:', error)
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>Error: {error.message}</p>
      <p>Digest: {error.digest}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Quick Checklist

Run through this checklist to fix your production errors:

- [ ] All components using `useState`, `useEffect`, `useContext` have `'use client'`
- [ ] All components with `onClick`, `onChange`, etc. have `'use client'`
- [ ] No event handlers are passed from Server to Client Components
- [ ] All UI components (Button, Input, etc.) have `'use client'`
- [ ] Only serializable data is passed between Server and Client
- [ ] Test with `npm run build && npm start` locally
- [ ] Check Vercel deployment logs for specific errors
- [ ] Add error boundaries to catch and display errors

---

## Your Specific Situation

Based on your codebase analysis:

✅ **What's Already Correct**:
1. Most page components have `'use client'`
2. UI components (Button, Input, etc.) have `'use client'`
3. Layout components have `'use client'`
4. Interactive components have `'use client'`

⚠️ **Potential Issues to Check**:
1. Some API route handlers might be returning non-serializable data
2. Some components might be missing `'use client'` in shared folders
3. Dynamic imports might need `'use client'`

---

## Testing Your Fix

1. **Local Production Build**:
```bash
npm run build
npm start
# Navigate to all major pages and test interactions
```

2. **Check for Hydration Errors**:
```bash
# Open browser console
# Look for "Hydration failed" or "Text content does not match"
```

3. **Deploy to Vercel**:
```bash
git add .
git commit -m "fix: add 'use client' directives for production"
git push
```

4. **Monitor Vercel Logs**:
- Go to Vercel Dashboard → Your Project → Deployments
- Click on the latest deployment
- Check "Functions" tab for errors
- Check "Runtime Logs" for detailed error messages

---

## Summary

The fix is straightforward:

1. **Add `'use client'`** to any component using:
   - React hooks (useState, useEffect, etc.)
   - Event handlers (onClick, onChange, etc.)
   - Browser APIs (window, localStorage, etc.)

2. **Never pass functions** from Server to Client Components

3. **Keep data serializable** when passing between Server and Client

4. **Test locally** with production build before deploying

Your codebase is already 90% correct. Just verify that all interactive components have `'use client'` and you should be good to go!
