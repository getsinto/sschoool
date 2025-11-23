# Teacher Dashboard Routing Fixes

## Problem Identified
The teacher dashboard is using incorrect route paths. Routes are prefixed with `/dashboard/teacher/` but should be `/teacher/` since the app is already in the `(dashboard)` layout group.

## Current (Incorrect) Routes
- `/dashboard/teacher/courses/create` ❌
- `/dashboard/teacher/live-classes/schedule` ❌
- `/dashboard/teacher/messages` ❌
- `/dashboard/teacher/grading` ❌

## Correct Routes
- `/teacher/courses/create` ✅
- `/teacher/live-classes/create` ✅ (or `/teacher/live-classes/schedule` if that page exists)
- `/teacher/messages/compose` ✅
- `/teacher/gradebook` ✅ (or `/teacher/grading` if that exists)

## Files to Fix
1. `app/(dashboard)/teacher/page.tsx` - Main dashboard with quick actions
2. Check all Link components for incorrect routing

## Additional Issues
1. **Notifications button** - No onClick handler or route
2. **Quick Action button** (top right) - No onClick handler or route  
3. **Profile section buttons** - Need to verify routing
4. **Grading center buttons** - Need proper handlers
5. **Student management buttons** - Need proper handlers

## Fix Strategy
1. Update all `/dashboard/teacher/` routes to `/teacher/`
2. Add proper onClick handlers for buttons without routes
3. Create modals for actions that don't need full pages
4. Verify all existing pages work correctly
