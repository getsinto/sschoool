# Teacher Dashboard - Comprehensive Fix Plan

## Overview
This document tracks ALL issues found in the Teacher Dashboard and their fixes.

## Issues Summary

### ✅ FIXED (Phase 1 - Already Complete)
1. **Dashboard Tab - Quick Actions**
   - ✅ Create New Course → Fixed to `/teacher/courses/create`
   - ✅ Schedule Live Class → Fixed to `/teacher/live-classes/create`
   - ✅ Send Message → Fixed to `/teacher/messages/compose`
   - ✅ View Pending Grading → Fixed to `/teacher/gradebook`

### 🔧 TO FIX (Phase 2 - Current Session)

#### 1. My Courses Tab (`/teacher/courses`)
**Issue:** "Create New Course" button has wrong route
- Current: `/dashboard/teacher/course-builder`
- Should be: `/teacher/courses/create`
- **Status:** NEEDS FIX

#### 2. Course Builder Tab (`/teacher/course-builder`)
**Issues:** Three buttons not working
- ❌ "Get Started" button - No onClick handler
- ❌ "Browse Templates" button - No onClick handler  
- ❌ "Import" button - No onClick handler
- **Status:** NEEDS IMPLEMENTATION

#### 3. Live Classes Tab (`/teacher/live-classes`)
**Issue:** "Schedule New Class" button has wrong route
- Current: `/dashboard/teacher/live-classes/schedule`
- Should be: `/teacher/live-classes/create`
- **Status:** NEEDS FIX

#### 4. Students Tab (`/teacher/students`)
**Issues:** Two buttons not working
- ❌ "Bulk Email" button - No onClick handler
- ❌ "Send Message" button - No onClick handler
- **Status:** NEEDS IMPLEMENTATION

#### 5. Grading Tab (`/teacher/grading`)
**Issues:** Two buttons not working
- ❌ "Schedule" button - No onClick handler
- ❌ "Bulk Feedback" button - No onClick handler
- **Status:** NEEDS IMPLEMENTATION

#### 6. Messages Tab (`/teacher/messages`)
**Issue:** "New Message" button has wrong route
- Current: `/dashboard/teacher/messages/compose`
- Should be: `/teacher/messages/compose`
- **Status:** NEEDS FIX

#### 7. Support Tab (`/teacher/support`)
**Issue:** Routes to wrong support center
- Current: Generic `/support/` routes
- Should be: Teacher-specific routes
- **Status:** ALREADY CORRECT (uses `/support/` which is role-agnostic)

#### 8. Profile Tab (`/teacher/profile`)
**Issues:** Four buttons not working
- ❌ "Edit Profile" button - No onClick handler
- ❌ "Personal Information" button - No onClick handler
- ❌ "Privacy Settings" button - No onClick handler
- ❌ "Certifications" button - No onClick handler
- **Status:** NEEDS IMPLEMENTATION

## Fix Strategy

### Phase 2A: Routing Fixes (Quick Wins)
1. Fix `/teacher/courses` - Create New Course button
2. Fix `/teacher/live-classes` - Schedule New Class button
3. Fix `/teacher/messages` - New Message button

### Phase 2B: Button Handlers (Modals/Routes)
1. Course Builder buttons - Route to course creation wizard
2. Students buttons - Implement bulk email/message modals
3. Grading buttons - Implement schedule/bulk feedback modals
4. Profile buttons - Route to settings pages or open modals

## Implementation Details

### Routing Fixes
```typescript
// teacher/courses/page.tsx
- href="/dashboard/teacher/course-builder"
+ href="/teacher/courses/create"

// teacher/live-classes/page.tsx
- href="/dashboard/teacher/live-classes/schedule"
+ href="/teacher/live-classes/create"

// teacher/messages/page.tsx
- href="/dashboard/teacher/messages/compose"
+ href="/teacher/messages/compose"
```

### Button Handlers to Implement

#### Course Builder
- "Get Started" → Route to `/teacher/courses/create`
- "Browse Templates" → Open template selection modal
- "Import" → Open file import dialog

#### Students
- "Bulk Email" → Open email compose modal with selected students
- "Send Message" → Open message modal

#### Grading
- "Schedule" → Open grading schedule modal
- "Bulk Feedback" → Open bulk feedback modal

#### Profile
- "Edit Profile" → Route to `/teacher/profile/edit`
- "Personal Information" → Route to `/teacher/settings/personal`
- "Privacy Settings" → Route to `/teacher/settings/privacy`
- "Certifications" → Route to `/teacher/settings/certifications`

## Testing Checklist

### Routing Tests
- [ ] My Courses → Create New Course button routes correctly
- [ ] Live Classes → Schedule New Class button routes correctly
- [ ] Messages → New Message button routes correctly

### Functionality Tests
- [ ] Course Builder → Get Started button works
- [ ] Course Builder → Browse Templates button works
- [ ] Course Builder → Import button works
- [ ] Students → Bulk Email button works
- [ ] Students → Send Message button works
- [ ] Grading → Schedule button works
- [ ] Grading → Bulk Feedback button works
- [ ] Profile → Edit Profile button works
- [ ] Profile → Personal Information button works
- [ ] Profile → Privacy Settings button works
- [ ] Profile → Certifications button works

## Notes
- Support tab is already correct (uses role-agnostic routes)
- Some buttons may need new pages created
- Some buttons can use modals instead of full pages
- Priority: Fix routing first, then implement handlers

---

**Status:** Phase 2 In Progress
**Last Updated:** November 23, 2025
