# Course Visibility & SEO Enhancement System - Phase 4 Integration Guide

**Date**: December 5, 2025  
**Status**: Phase 4 - Integration & Admin APIs

---

## Phase 4 Overview

Phase 4 focuses on integrating the visibility and SEO components into the course builder and creating admin management APIs.

---

## ✅ Completed in Phase 4

### 1. Admin Labels Management API
**Files Created**:
- `app/api/admin/labels/route.ts` (GET, POST)
- `app/api/admin/labels/[id]/route.ts` (PATCH, DELETE)

**Features**:
- ✅ GET all active labels
- ✅ POST create new label (admin only)
- ✅ PATCH update label (admin only)
- ✅ DELETE soft-delete label (admin only)
- ✅ Name uniqueness validation
- ✅ Display order management
- ✅ Permission checks

**Endpoints**:
```typescript
GET  /api/admin/labels
  - Returns: { labels: Label[] }
  - Public access (for course creation)

POST /api/admin/labels
  - Body: { name, description?, color, icon? }
  - Returns: { success, label }
  - Admin only

PATCH /api/admin/labels/[id]
  - Body: { name?, description?, color?, icon?, is_active?, display_order? }
  - Returns: { success, label }
  - Admin only

DELETE /api/admin/labels/[id]
  - Soft deletes (sets is_active = false)
  - Returns: { success, message }
  - Admin only
```

---

## 🔄 Integration Steps

### Step 1: Integrate into Course Builder

The course creation page needs to be updated to include the new visibility, SEO, and labels tabs.

**File to Update**: `app/(dashboard)/teacher/courses/create/page.tsx`

**Add New Tabs**:
```tsx
const tabs = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'media', label: 'Media', icon: Image },
  // NEW TABS
  { id: 'visibility', label: 'Visibility', icon: Eye },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'labels', label: 'Labels', icon: Tag },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'review', label: 'Review', icon: CheckCircle }
]
```

**Add Tab Content**:
```tsx
{activeTab === 'visibility' && (
  <VisibilitySettings
    courseId={courseId}
    status={formData.status}
    visibility={formData.visibility}
    scheduledPublishAt={formData.scheduled_publish_at}
    allowedRoles={formData.allowed_roles}
    allowedGrades={formData.allowed_grades}
    allowedCountries={formData.allowed_countries}
    excludedCountries={formData.excluded_countries}
    visibleFrom={formData.visible_from}
    visibleUntil={formData.visible_until}
    isFeatured={formData.is_featured}
    accessCodes={formData.access_codes}
    onChange={(settings) => setFormData({ ...formData, ...settings })}
  />
)}

{activeTab === 'seo' && (
  <SEOOptimization
    courseId={courseId}
    title={formData.title}
    description={formData.description}
    metaTitle={formData.meta_title}
    metaDescription={formData.meta_description}
    seoKeywords={formData.seo_keywords}
    urlSlug={formData.url_slug}
    ogTitle={formData.og_title}
    ogDescription={formData.og_description}
    ogImageUrl={formData.og_image_url}
    onChange={(seoData) => setFormData({ ...formData, ...seoData })}
  />
)}

{activeTab === 'labels' && (
  <CourseLabels
    courseId={courseId}
    selectedLabels={formData.custom_labels || []}
    onChange={(labels) => setFormData({ ...formData, custom_labels: labels })}
  />
)}

{activeTab === 'preview' && (
  <div className="space-y-6">
    <SEOPreview
      title={formData.title}
      metaTitle={formData.meta_title}
      description={formData.description}
      metaDescription={formData.meta_description}
      urlSlug={formData.url_slug}
      thumbnail={formData.thumbnail}
      ogTitle={formData.og_title}
      ogDescription={formData.og_description}
      ogImage={formData.og_image_url}
    />
  </div>
)}
```

**Update Form Data Interface**:
```tsx
interface CourseFormData {
  // Existing fields...
  
  // Visibility fields
  status?: string
  visibility?: string
  scheduled_publish_at?: string | null
  allowed_roles?: string[] | null
  allowed_grades?: string[] | null
  allowed_countries?: string[] | null
  excluded_countries?: string[] | null
  visible_from?: string | null
  visible_until?: string | null
  is_featured?: boolean
  access_codes?: string[] | null
  
  // SEO fields
  meta_title?: string | null
  meta_description?: string | null
  seo_keywords?: string[] | null
  url_slug?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image_url?: string | null
  twitter_card_type?: string | null
  canonical_url?: string | null
  robots_meta?: string | null
  
  // Labels
  custom_labels?: string[] | null
  tags?: string[] | null
}
```

---

### Step 2: Update CourseCard Component

**File to Update**: `components/teacher/courses/CourseCard.tsx`

**Add Status Badge**:
```tsx
import { COURSE_STATUSES } from '@/types/course'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  hidden: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-800',
  deprecated: 'bg-orange-100 text-orange-800'
}

// In the component
{course.status && (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[course.status]}`}>
    {course.status.replace('_', ' ').toUpperCase()}
  </span>
)}
```

**Add SEO Score Indicator**:
```tsx
{course.seo_score !== undefined && (
  <div className="flex items-center gap-1">
    <Search className="w-4 h-4 text-gray-400" />
    <span className={`text-sm font-medium ${
      course.seo_score >= 80 ? 'text-green-600' :
      course.seo_score >= 60 ? 'text-yellow-600' :
      'text-red-600'
    }`}>
      SEO: {course.seo_score}/100
    </span>
  </div>
)}
```

**Add Labels Display**:
```tsx
{course.custom_labels && course.custom_labels.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {course.custom_labels.slice(0, 3).map(label => (
      <span key={label} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
        {label}
      </span>
    ))}
    {course.custom_labels.length > 3 && (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
        +{course.custom_labels.length - 3}
      </span>
    )}
  </div>
)}
```

---

### Step 3: Update Course Detail Page (Public)

**File to Update**: `app/(public)/courses/[slug]/page.tsx`

**Use URL Slug for Routing**:
```tsx
// Change from [id] to [slug]
export default async function CourseDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch course by slug instead of ID
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('url_slug', params.slug)
    .eq('status', 'published')
    .single()
    
  if (!course) {
    notFound()
  }
  
  // Track view
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${course.id}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referrer: headers().get('referer') })
  })
  
  // Generate meta tags
  const metaTags = generateMetaTags(course)
  const schemaMarkup = generateSchemaMarkup(course)
  
  return (
    <>
      <Head>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        <link rel="canonical" href={metaTags.canonical} />
        <meta name="robots" content={metaTags.robots} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTags.openGraph.title} />
        <meta property="og:description" content={metaTags.openGraph.description} />
        <meta property="og:image" content={metaTags.openGraph.image} />
        <meta property="og:type" content={metaTags.openGraph.type} />
        <meta property="og:url" content={metaTags.openGraph.url} />
        
        {/* Twitter */}
        <meta name="twitter:card" content={metaTags.twitter.card} />
        <meta name="twitter:title" content={metaTags.twitter.title} />
        <meta name="twitter:description" content={metaTags.twitter.description} />
        <meta name="twitter:image" content={metaTags.twitter.image} />
        
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </Head>
      
      {/* Course content */}
    </>
  )
}
```

---

### Step 4: Create Admin Components

#### 4.1 Labels Manager Component

**File to Create**: `components/admin/courses/LabelsManager.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'

export default function LabelsManager() {
  const [labels, setLabels] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingLabel, setEditingLabel] = useState(null)
  
  // Fetch labels
  // Create/Edit/Delete handlers
  // Drag and drop reordering
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Labels</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Create Label
        </button>
      </div>
      
      {/* Labels list with drag-drop */}
      {/* Create/Edit modal */}
    </div>
  )
}
```

#### 4.2 SEO Dashboard Component

**File to Create**: `components/admin/courses/SEODashboard.tsx`

```tsx
'use client'

export default function SEODashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">SEO Overview</h2>
      
      {/* Average SEO score */}
      {/* Courses with low SEO scores */}
      {/* Missing meta descriptions */}
      {/* Duplicate slugs */}
      {/* Sitemap status */}
    </div>
  )
}
```

#### 4.3 Visibility Dashboard Component

**File to Create**: `components/admin/courses/VisibilityDashboard.tsx`

```tsx
'use client'

export default function VisibilityDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Visibility</h2>
      
      {/* Status breakdown */}
      {/* Pending approval queue */}
      {/* Scheduled courses calendar */}
      {/* Featured courses */}
      {/* Hidden/Archived courses */}
    </div>
  )
}
```

---

## 📋 Integration Checklist

### Course Builder Integration
- [ ] Add Visibility tab to course creation
- [ ] Add SEO tab to course creation
- [ ] Add Labels tab to course creation
- [ ] Add Preview tab to course creation
- [ ] Update form data interface
- [ ] Add form validation for new fields
- [ ] Update save/submit handlers
- [ ] Test full course creation flow

### CourseCard Updates
- [ ] Add status badge display
- [ ] Add SEO score indicator
- [ ] Add labels display
- [ ] Add visibility indicator icon
- [ ] Update hover states
- [ ] Test responsive layout

### Public Course Page Updates
- [ ] Change routing from [id] to [slug]
- [ ] Add meta tags to head
- [ ] Add Open Graph tags
- [ ] Add Twitter card tags
- [ ] Add Schema.org markup
- [ ] Implement view tracking
- [ ] Test social media sharing
- [ ] Test SEO crawlers

### Admin Components
- [ ] Create LabelsManager component
- [ ] Create SEODashboard component
- [ ] Create VisibilityDashboard component
- [ ] Add admin routes
- [ ] Test CRUD operations
- [ ] Add permission checks

---

## 🎯 Next Steps (Phase 5)

### Auto-Features Implementation

1. **Auto-Publish Scheduled Courses**
   - Create cron job: `/api/cron/auto-publish-courses`
   - Run every 5 minutes
   - Check for courses with `scheduled_publish_at <= now()`
   - Update status to 'published'
   - Send notifications

2. **Auto-Trending Detection**
   - Create cron job: `/api/cron/detect-trending-courses`
   - Run daily
   - Calculate trending score based on:
     - View count (last 7 days)
     - Enrollment count (last 7 days)
     - Rating changes
   - Update `is_trending` flag

3. **Auto-New Badge**
   - Add computed field or function
   - Check if `created_at` is within last 30 days
   - Display "NEW" badge on course cards

4. **Auto-SEO Audit**
   - Create cron job: `/api/cron/audit-course-seo`
   - Run weekly
   - Recalculate SEO scores
   - Create audit records
   - Send reports to admins

### Notifications Implementation

1. **Course Published**
   - Trigger: Status changes to 'published'
   - Recipient: Course creator
   - Template: "Your course is now live!"

2. **Scheduled Publish**
   - Trigger: Auto-publish cron
   - Recipient: Course creator
   - Template: "Your scheduled course is now live!"

3. **Approval Needed**
   - Trigger: Status changes to 'pending_approval'
   - Recipient: All admins
   - Template: "New course awaiting approval"

4. **Course Approved**
   - Trigger: Admin approves course
   - Recipient: Course creator
   - Template: "Your course has been approved!"

---

## 🧪 Testing Guide

### API Testing
```bash
# Get all labels
curl http://localhost:3000/api/admin/labels

# Create label (admin)
curl -X POST http://localhost:3000/api/admin/labels \
  -H "Content-Type: application/json" \
  -d '{"name":"Bestseller","color":"#FFD700","icon":"⭐"}'

# Update label
curl -X PATCH http://localhost:3000/api/admin/labels/[id] \
  -H "Content-Type: application/json" \
  -d '{"color":"#FFA500"}'

# Delete label
curl -X DELETE http://localhost:3000/api/admin/labels/[id]
```

### Component Testing
```tsx
// Test CourseLabels component
<CourseLabels
  courseId="test-id"
  selectedLabels={['Bestseller', 'New']}
  onChange={(labels) => console.log(labels)}
/>

// Test SEOPreview component
<SEOPreview
  title="Test Course"
  description="Test description"
  urlSlug="test-course"
/>
```

---

## 📊 Database Queries

### Get courses with low SEO scores
```sql
SELECT id, title, seo_score, url_slug
FROM courses
WHERE seo_score < 60
  AND status = 'published'
ORDER BY seo_score ASC
LIMIT 20;
```

### Get pending approval courses
```sql
SELECT id, title, created_by, submitted_for_approval_at
FROM courses
WHERE status = 'pending_approval'
ORDER BY submitted_for_approval_at ASC;
```

### Get scheduled courses
```sql
SELECT id, title, scheduled_publish_at
FROM courses
WHERE status = 'scheduled'
  AND scheduled_publish_at <= NOW() + INTERVAL '7 days'
ORDER BY scheduled_publish_at ASC;
```

### Get trending courses
```sql
SELECT c.id, c.title, c.view_count, COUNT(e.id) as enrollments
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
  AND e.created_at >= NOW() - INTERVAL '7 days'
WHERE c.status = 'published'
GROUP BY c.id
HAVING c.view_count > 100 OR COUNT(e.id) > 10
ORDER BY (c.view_count + COUNT(e.id) * 10) DESC
LIMIT 10;
```

---

## 🚀 Deployment Checklist

- [ ] Run database migrations
- [ ] Test all API endpoints
- [ ] Verify permission checks
- [ ] Test course creation flow
- [ ] Test SEO meta tags
- [ ] Test sitemap generation
- [ ] Test view tracking
- [ ] Configure cron jobs
- [ ] Set up monitoring
- [ ] Update documentation

---

**Status**: Phase 4 APIs Complete - Ready for Integration  
**Next**: Integrate components into course builder and create admin dashboards  
**Last Updated**: December 5, 2025
