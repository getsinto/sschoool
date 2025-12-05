# Fix Test Dependencies - Quick Guide

## Issue

Test files have TypeScript errors due to missing testing library dependencies.

**Impact**: None on production code - tests only

## Quick Fix

Run this command to install missing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

## What This Fixes

- ✅ `@testing-library/react` - React component testing utilities
- ✅ `@testing-library/jest-dom` - Custom Jest matchers (toBeInTheDocument, etc.)
- ✅ `@testing-library/user-event` - User interaction simulation
- ✅ `@types/jest` - Jest type definitions

## Affected Files

- `__tests__/api/admin/courseFiltering.test.ts`
- `__tests__/api/admin/courses.test.ts`
- `__tests__/components/admin/categories/CategoryModal.test.tsx`
- `__tests__/components/teacher/course-builder/AgeGroupSelector.test.tsx`
- `__tests__/components/teacher/course-builder/BasicInfoForm.test.tsx`
- `__tests__/components/teacher/course-builder/IconSelector.test.tsx`

## Verification

After installing, run:

```bash
npm run test
```

Or check TypeScript:

```bash
npx tsc --noEmit
```

## Priority

**Low** - This is optional and does not block production deployment.

## Status

- Production Code: ✅ No errors
- Test Code: ⚠️ Minor type errors (fixable with above command)

