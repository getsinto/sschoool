# Course Visibility & SEO - Quick Start Guide

**For**: Developers integrating the system  
**Time**: 15 minutes  
**Date**: December 5, 2025

---

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migration
```bash
# Apply the migration
supabase migration up

# Or manually run
psql -f supabase/migrations/20250109000001_course_visibility_seo_enhancements.sql
```

### 2. Verify Tables Created
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('course_labels', 'course_views', 'course_seo_audits');
```

### 3. Seed Default Labels (Optional)
The migration already creates 10 default labels, but you can add more:
```sql
INSERT INTO course_labels (name, description, color, icon, display_order)
VALUES 
  ('Premium', 'Premium quality course', '#FFD700', '⭐', 11),
  ('Certified', 'Includes certification', '#4CAF50', '🎓', 12);
```

---

## 📝 Basic Usage (5 minutes)

### For Teachers - Course Creation

```tsx
import VisibilitySettings from '@/components/teacher/course-builder/VisibilitySettings'
import SEOOptimization from '@/components/teacher/course-builder/SEOOptimization'
import CourseLabels from '@/components/teacher/course-builder/CourseLabels'
import SEOPreview from '@/components/teacher/course-builder/SEOPreview'

// In your course form
<VisibilitySettings
  courseId={courseId}
  status="draft"
  visibility="everyone"
  onChange={(settings) => handleVisibilityChange(settings)}
/>

<SEOOptimization
  courseId={courseId}
  title={formData.title}
  description={formData.description}
  onChange={(seoData) => handleSEOChange(seoData)}
/>

<CourseLabels
  courseId={courseId}
  selectedLabels={formData.custom_labels || []}
  onChange={(labels) => setFormData({ ...formData, custom_labels: labels })}
/>

<SEOPreview
  title={formData.title}
  metaTitle={formData.meta_title}
  description={formData.description}
  metaDescription={formData.meta_description}
  urlSlug={formData.url_slug}
  thumbnail={formData.thumbnail}
/>
```

### For Developers - API Calls

```typescript
// Update visibility
await fetch(`/api/teacher/courses/${courseId}/visibility`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'published',
    visibility: 'everyone',
    is_featured: true
  })
})

// Update SEO
await fetch(`/api/teacher/courses/${courseId}/seo`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    meta_title: 'Learn React - Complete Guide',
    meta_description: 'Master React from basics to advanced concepts',
    seo_keywords: ['react', 'javascript', 'web development'],
    url_slug: 'learn-react-complete-guide'
  })
})

// Check slug availability
const response = await fetch('/api/seo/check-slug', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slug: 'my-course-slug' })
})
const { available, suggestions } = await response.json()

// Track course view
await fetch(`/api/courses/${courseId}/view`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ referrer: document.referrer })
})
```

---

## 🎯 Common Tasks (5 minutes)

### Task 1: Publish a Course
```typescript
// 1. Set status to published
await updateVisibility({ status: 'published' })

// 2. Ensure SEO is optimized (score > 60)
const { seo_score } = await fetch(`/api/teacher/courses/${id}/seo`).then(r => r.json())

// 3. Add relevant labels
await updateLabels(['Bestseller', 'New'])

// 4. Verify it appears in sitemap
// Visit: /api/seo/sitemap.xml
```

### Task 2: Schedule a Course
```typescript
await updateVisibility({
  status: 'scheduled',
  scheduled_publish_at: '2025-12-25T00:00:00Z'
})

// Auto-publishes at scheduled time via cron job
```

### Task 3: Optimize SEO Score
```typescript
// Get current score and suggestions
const { seo_score, issues, suggestions } = await getSEOData(courseId)

// Fix issues one by one
if (seo_score.breakdown.metaTitle < 10) {
  await updateSEO({ meta_title: 'Optimized Title 50-60 chars' })
}

if (seo_score.breakdown.keywords < 10) {
  await updateSEO({ seo_keywords: ['keyword1', 'keyword2', 'keyword3'] })
}

// Recalculate score
const newScore = await getSEOData(courseId)
```

### Task 4: Restrict Course Access
```typescript
// Only for logged-in users
await updateVisibility({
  visibility: 'logged_in'
})

// Only for specific roles
await updateVisibility({
  visibility: 'specific_roles',
  allowed_roles: ['student', 'parent']
})

// Only for specific grades
await updateVisibility({
  visibility: 'specific_grades',
  allowed_grades: ['grade-9', 'grade-10']
})

// Invite-only with access codes
await updateVisibility({
  visibility: 'invite_only',
  access_codes: ['CODE123', 'CODE456']
})
```

---

## 🔍 Testing Checklist

### Frontend Testing
- [ ] VisibilitySettings component renders
- [ ] SEOOptimization component calculates score
- [ ] CourseLabels component fetches labels
- [ ] SEOPreview shows all 4 platforms
- [ ] Character counters work correctly
- [ ] Form validation works

### API Testing
```bash
# Test visibility API
curl -X PATCH http://localhost:3000/api/teacher/courses/[id]/visibility \
  -H "Content-Type: application/json" \
  -d '{"status":"published"}'

# Test SEO API
curl http://localhost:3000/api/teacher/courses/[id]/seo

# Test slug validation
curl -X POST http://localhost:3000/api/seo/check-slug \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-course"}'

# Test sitemap
curl http://localhost:3000/api/seo/sitemap.xml

# Test view tracking
curl -X POST http://localhost:3000/api/courses/[id]/view \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Database Testing
```sql
-- Check course has SEO fields
SELECT id, title, status, visibility, seo_score, url_slug 
FROM courses 
WHERE id = 'your-course-id';

-- Check labels exist
SELECT * FROM course_labels WHERE is_active = true;

-- Check views are tracked
SELECT * FROM course_views WHERE course_id = 'your-course-id';

-- Check SEO audits
SELECT * FROM course_seo_audits WHERE course_id = 'your-course-id';
```

---

## 🐛 Troubleshooting

### Issue: SEO score not calculating
**Solution**: Check that all required fields exist in database
```sql
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
```

### Issue: Slug validation fails
**Solution**: Ensure slug follows format (lowercase, numbers, hyphens only)
```typescript
const validSlug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
```

### Issue: Labels not showing
**Solution**: Check labels API is accessible
```bash
curl http://localhost:3000/api/admin/labels
```

### Issue: View tracking not working
**Solution**: Verify course_views table exists and has RLS policies
```sql
SELECT * FROM course_views LIMIT 1;
```

---

## 📚 Key Files Reference

### Components
- `components/teacher/course-builder/VisibilitySettings.tsx`
- `components/teacher/course-builder/SEOOptimization.tsx`
- `components/teacher/course-builder/CourseLabels.tsx`
- `components/teacher/course-builder/SEOPreview.tsx`

### API Routes
- `app/api/teacher/courses/[id]/visibility/route.ts`
- `app/api/teacher/courses/[id]/seo/route.ts`
- `app/api/seo/check-slug/route.ts`
- `app/api/courses/[id]/view/route.ts`
- `app/api/seo/sitemap.xml/route.ts`
- `app/api/admin/labels/route.ts`

### Libraries
- `lib/seo/analyzer.ts` - SEO scoring and utilities

### Types
- `types/course.ts` - Course visibility and SEO types

### Database
- `supabase/migrations/20250109000001_course_visibility_seo_enhancements.sql`

---

## 🎓 Best Practices

### For Teachers
1. **Always optimize SEO** before publishing (target score 75+)
2. **Use descriptive slugs** that match course content
3. **Add 3-10 keywords** for better discoverability
4. **Preview on all platforms** before publishing
5. **Use labels** to categorize courses
6. **Schedule courses** during peak enrollment times

### For Developers
1. **Validate slugs** before saving
2. **Calculate SEO scores** after updates
3. **Track views** on public pages
4. **Cache sitemap** for performance
5. **Use TypeScript types** for type safety
6. **Handle errors gracefully**

### For Admins
1. **Review pending approvals** daily
2. **Monitor SEO scores** weekly
3. **Update labels** as needed
4. **Check sitemap** regularly
5. **Audit low-scoring courses**
6. **Promote high-quality content**

---

## 🚀 Next Steps

1. **Integrate into course builder** - Add tabs for visibility, SEO, labels
2. **Update CourseCard** - Show status, SEO score, labels
3. **Update public pages** - Add meta tags, track views
4. **Create admin dashboards** - Labels manager, SEO dashboard
5. **Implement cron jobs** - Auto-publish, trending detection
6. **Add notifications** - Status changes, approvals

---

## 📞 Support

- **Documentation**: See `COURSE_VISIBILITY_SEO_COMPLETE_SUMMARY.md`
- **Integration Guide**: See `COURSE_VISIBILITY_SEO_PHASE_4_INTEGRATION.md`
- **API Reference**: See individual phase completion docs

---

**Quick Start Complete!** 🎉

You now have the Course Visibility & SEO Enhancement System ready to use.

For detailed information, refer to the complete documentation files.
