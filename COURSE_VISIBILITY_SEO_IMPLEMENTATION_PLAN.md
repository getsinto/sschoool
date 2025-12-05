# Course Visibility & SEO Enhancement - Implementation Plan

## Status: Phase 1 Complete ✅

### Completed Items

#### 1. Database Migration ✅
- **File**: `supabase/migrations/20250109000001_course_visibility_seo_enhancements.sql`
- Added 8 status types (draft, pending_approval, approved, published, scheduled, hidden, archived, deprecated)
- Added visibility controls (everyone, logged_in, specific_roles, specific_grades, invite_only)
- Added geography restrictions (allowed/excluded countries)
- Added time-based visibility (visible_from, visible_until)
- Added SEO fields (meta_title, meta_description, seo_keywords, url_slug)
- Added Open Graph tags (og_title, og_description, og_image_url)
- Added Twitter card support
- Created `course_labels` table with 10 default labels
- Created `course_views` tracking table
- Created `course_seo_audits` table
- Added auto-slug generation function
- Added SEO score calculation function
- Added auto-publish scheduled courses function
- Added RLS policies for visibility control
- Added performance indexes

#### 2. SEO Analyzer Library ✅
- **File**: `lib/seo/analyzer.ts`
- `calculateSEOScore()` - Comprehensive SEO scoring (0-100)
- `generateMetaTags()` - Generate HTML meta tags
- `generateSchemaMarkup()` - Generate JSON-LD structured data
- `generateSitemap()` - Generate sitemap.xml
- `validateSlug()` - Validate URL slug format
- `generateSlugFromTitle()` - Auto-generate slugs
- `suggestKeywords()` - AI-suggested keywords

---

## Phase 2: Core Components (To Be Implemented)

### 2.1 Visibility Settings Component
**File**: `components/teacher/course-builder/VisibilitySettings.tsx`

```tsx
Features:
- Status selector (8 statuses)
- Schedule publishing (date/time picker)
- Visibility rules selector
- Geography restrictions (country selector)
- Time-based visibility (date range)
- Featured toggle
- Access codes management
- Preview mode
```

### 2.2 SEO Optimization Component
**File**: `components/teacher/course-builder/SEOOptimization.tsx`

```tsx
Features:
- Meta title editor (character counter)
- Meta description editor (character counter)
- Keywords input (tag selector)
- URL slug editor (validation)
- Social media preview (Google, Facebook, Twitter)
- SEO score indicator (0-100 with breakdown)
- Optimization tips
- Schema markup preview
```

### 2.3 Course Labels Component
**File**: `components/teacher/course-builder/CourseLabels.tsx`

```tsx
Features:
- Add/remove labels
- Custom label creator (admin only)
- Label preview
- Label color picker
- Label icon selector
```

### 2.4 SEO Preview Component
**File**: `components/teacher/course-builder/SEOPreview.tsx`

```tsx
Features:
- Google Search Result preview
- Facebook share preview
- Twitter card preview
- LinkedIn share preview
- Real-time updates
```

---

## Phase 3: API Routes (To Be Implemented)

### 3.1 Visibility API
**File**: `app/api/teacher/courses/[id]/visibility/route.ts`

```typescript
PATCH /api/teacher/courses/[id]/visibility
- Update status
- Update visibility rules
- Schedule publishing
- Set geography restrictions
- Set time-based visibility
```

### 3.2 SEO API
**File**: `app/api/teacher/courses/[id]/seo/route.ts`

```typescript
GET /api/teacher/courses/[id]/seo
- Get SEO score
- Get SEO suggestions
- Get meta tags preview

PATCH /api/teacher/courses/[id]/seo
- Update meta title/description
- Update keywords
- Update URL slug
- Update Open Graph tags
```

### 3.3 Slug Validation API
**File**: `app/api/seo/check-slug/route.ts`

```typescript
POST /api/seo/check-slug
- Check if slug is available
- Suggest alternative slugs
```

### 3.4 Sitemap API
**File**: `app/api/seo/sitemap.xml/route.ts`

```typescript
GET /api/seo/sitemap.xml
- Generate sitemap for all published courses
- Include priority and change frequency
- Cache for performance
```

### 3.5 Bulk Visibility API
**File**: `app/api/admin/courses/bulk-visibility/route.ts`

```typescript
PATCH /api/admin/courses/bulk-visibility
- Bulk status changes
- Bulk visibility updates
- Bulk featured toggle
```

### 3.6 Course Views API
**File**: `app/api/courses/[id]/view/route.ts`

```typescript
POST /api/courses/[id]/view
- Track course view
- Record user, IP, referrer
- Update view count
```

---

## Phase 4: Admin Components (To Be Implemented)

### 4.1 SEO Manager (Admin)
**File**: `components/admin/courses/SEOManager.tsx`

```tsx
Features:
- Bulk SEO optimization
- Sitemap generator
- Indexing status monitor
- SEO analytics dashboard
- Keyword research tool
```

### 4.2 Course Labels Manager (Admin)
**File**: `components/admin/courses/LabelsManager.tsx`

```tsx
Features:
- Create/edit/delete labels
- Set label colors and icons
- Reorder labels
- Enable/disable labels
```

### 4.3 Visibility Dashboard (Admin)
**File**: `components/admin/courses/VisibilityDashboard.tsx`

```tsx
Features:
- Overview of all course statuses
- Pending approval queue
- Scheduled courses calendar
- Featured courses manager
- Visibility analytics
```

---

## Phase 5: Enhanced Features (To Be Implemented)

### 5.1 Auto-Features

#### Auto-Slug Generation
- Trigger: On course title change
- Function: `generate_course_slug()`
- Ensures uniqueness

#### Auto-SEO Score
- Trigger: On course update
- Function: `calculate_course_seo_score()`
- Updates in real-time

#### Auto-Publish Scheduled
- Cron job: Every 5 minutes
- Function: `auto_publish_scheduled_courses()`
- Sends notifications

#### Auto-Trending Detection
- Cron job: Daily
- Logic: Based on views/enrollments
- Updates `is_trending` flag

#### Auto-New Badge
- Logic: Courses < 30 days old
- Function: `is_course_new()`
- Auto-expires

### 5.2 Notifications

#### Course Published
- To: Course creator
- When: Status changes to 'published'
- Content: "Your course is now live!"

#### Scheduled Publish
- To: Course creator
- When: Course auto-published
- Content: "Your scheduled course is now live!"

#### Approval Needed
- To: Admins
- When: Status changes to 'pending_approval'
- Content: "New course awaiting approval"

#### Course Approved
- To: Course creator
- When: Admin approves course
- Content: "Your course has been approved!"

---

## Phase 6: Integration Updates (To Be Implemented)

### 6.1 Update Existing Components

#### CourseCard Component
**File**: `components/teacher/courses/CourseCard.tsx`
- Add status badge
- Add visibility indicator
- Add SEO score indicator
- Add labels display

#### Course Detail Page
**File**: `app/(public)/courses/[slug]/page.tsx`
- Use URL slug instead of ID
- Add meta tags
- Add schema markup
- Track course views

#### Course Builder
**File**: `app/(dashboard)/teacher/courses/create/page.tsx`
- Add Visibility Settings tab
- Add SEO Optimization tab
- Add Labels tab
- Add Preview tab

### 6.2 Update Types

#### Course Type
**File**: `types/course.ts`
```typescript
Add fields:
- status
- visibility
- scheduled_publish_at
- allowed_roles
- allowed_countries
- visible_from/until
- meta_title/description
- seo_keywords
- url_slug
- og_title/description/image
- tags
- custom_labels
- seo_score
- view_count
- is_trending/bestseller
```

---

## Phase 7: Testing & Documentation (To Be Implemented)

### 7.1 Unit Tests
- SEO analyzer functions
- Slug validation
- Visibility rules logic
- Auto-publish function

### 7.2 Integration Tests
- Course visibility based on status
- Geography restrictions
- Time-based visibility
- Scheduled publishing

### 7.3 E2E Tests
- Complete course creation flow
- SEO optimization workflow
- Approval workflow
- Publishing workflow

### 7.4 Documentation
- Teacher guide: Course visibility
- Teacher guide: SEO optimization
- Admin guide: Approval workflow
- Admin guide: SEO management
- API documentation

---

## Implementation Priority

### High Priority (Implement First)
1. ✅ Database migration
2. ✅ SEO analyzer library
3. ⏭️ Visibility Settings component
4. ⏭️ SEO Optimization component
5. ⏭️ Visibility API routes
6. ⏭️ SEO API routes

### Medium Priority (Implement Second)
7. ⏭️ SEO Preview component
8. ⏭️ Course Labels component
9. ⏭️ Slug validation API
10. ⏭️ Course views tracking
11. ⏭️ Update CourseCard component
12. ⏭️ Update course detail page

### Low Priority (Implement Last)
13. ⏭️ Admin SEO Manager
14. ⏭️ Admin Labels Manager
15. ⏭️ Sitemap generation
16. ⏭️ Bulk operations
17. ⏭️ Analytics dashboard
18. ⏭️ Auto-features (trending, etc.)

---

## Database Schema Summary

### New Columns in `courses` table:
```sql
-- Status & Visibility
status TEXT (8 options)
visibility TEXT (5 options)
scheduled_publish_at TIMESTAMPTZ
allowed_roles TEXT[]
allowed_grades TEXT[]
allowed_countries TEXT[]
excluded_countries TEXT[]
visible_from DATE
visible_until DATE
is_featured BOOLEAN
featured_order INTEGER

-- SEO
meta_title TEXT
meta_description TEXT
seo_keywords TEXT[]
url_slug TEXT UNIQUE
og_title TEXT
og_description TEXT
og_image_url TEXT
twitter_card_type TEXT
canonical_url TEXT
robots_meta TEXT

-- Discovery
tags TEXT[]
subcategories TEXT[]
custom_labels TEXT[]
seo_score INTEGER
view_count INTEGER
is_trending BOOLEAN
is_bestseller BOOLEAN

-- Workflow
replaced_by_course_id UUID
submitted_for_approval_at TIMESTAMPTZ
approved_at TIMESTAMPTZ
approved_by UUID
approval_notes TEXT
```

### New Tables:
1. `course_labels` - Predefined course labels
2. `course_views` - Track course page views
3. `course_seo_audits` - SEO audit history

---

## API Endpoints Summary

### Teacher Endpoints
- `PATCH /api/teacher/courses/[id]/visibility` - Update visibility
- `GET /api/teacher/courses/[id]/seo` - Get SEO data
- `PATCH /api/teacher/courses/[id]/seo` - Update SEO
- `POST /api/teacher/courses/[id]/submit-approval` - Submit for approval

### Admin Endpoints
- `PATCH /api/admin/courses/bulk-visibility` - Bulk updates
- `GET /api/admin/courses/pending-approval` - Get pending courses
- `POST /api/admin/courses/[id]/approve` - Approve course
- `POST /api/admin/courses/[id]/reject` - Reject course
- `GET /api/admin/seo/analytics` - SEO analytics

### Public Endpoints
- `GET /api/seo/sitemap.xml` - Generate sitemap
- `POST /api/seo/check-slug` - Validate slug
- `POST /api/courses/[id]/view` - Track view

---

## Next Steps

1. **Review and approve** this implementation plan
2. **Prioritize** which phases to implement first
3. **Implement Phase 2** (Core Components)
4. **Implement Phase 3** (API Routes)
5. **Test** each phase thoroughly
6. **Document** for users
7. **Deploy** to production

---

## Estimated Timeline

- **Phase 1** (Database + Library): ✅ Complete
- **Phase 2** (Core Components): 2-3 days
- **Phase 3** (API Routes): 2 days
- **Phase 4** (Admin Components): 2 days
- **Phase 5** (Enhanced Features): 1-2 days
- **Phase 6** (Integration): 1-2 days
- **Phase 7** (Testing & Docs): 2 days

**Total**: 10-14 days for complete implementation

---

## Benefits

### For Teachers
- ✅ Complete control over course visibility
- ✅ Schedule courses in advance
- ✅ Optimize for search engines
- ✅ Better social media sharing
- ✅ Track course performance

### For Students
- ✅ Better course discovery
- ✅ More relevant search results
- ✅ Clear course information
- ✅ Better social sharing

### For Admins
- ✅ Approval workflow
- ✅ Bulk operations
- ✅ SEO analytics
- ✅ Better content control

### For Platform
- ✅ Better SEO rankings
- ✅ More organic traffic
- ✅ Professional appearance
- ✅ Competitive advantage

---

**Status**: Phase 1 Complete - Ready for Phase 2 Implementation
**Last Updated**: December 5, 2025
