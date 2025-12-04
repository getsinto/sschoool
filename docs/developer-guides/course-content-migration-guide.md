# Course Content Enhancement - Migration Guide

## 📋 Overview

This guide helps you migrate from the old course content system to the new enhanced system with minimal disruption.

---

## 🔄 What's Changing

### Database Changes

1. **Sections → Modules**
   - Table renamed from `sections` to `modules`
   - 6 new columns added
   - All existing data preserved

2. **Lessons Enhanced**
   - 12 new columns added
   - New lesson types: text, image, mixed
   - Video enhancements: quality, subtitles, chapters
   - All existing lessons remain functional

3. **New Table: lesson_resources**
   - Stores supplementary materials
   - Linked to lessons
   - Supports multiple resource types

### API Changes

1. **Endpoint Updates**
   - `/api/courses/[id]/sections` → `/api/courses/[id]/modules`
   - New endpoints for resources
   - Backward compatibility maintained

2. **Response Format**
   - Additional fields in responses
   - All existing fields preserved
   - Optional fields are nullable

### Component Changes

1. **Teacher Components**
   - SectionModal → ModuleModal
   - Enhanced LessonModal
   - New: TextLessonEditor, ImageLessonGallery
   - New: VideoEnhancementsForm, LessonResourcesManager

2. **Student Components**
   - New: EnhancedVideoPlayer
   - New: TextLessonViewer, ImageGalleryViewer
   - New: LessonResourcesList

---

## 🚀 Migration Steps

### Step 1: Backup Database

**CRITICAL**: Always backup before migration!

```bash
# Using Supabase CLI
supabase db dump > backup_$(date +%Y%m%d).sql

# Or using pg_dump
pg_dump -h your-host -U your-user -d your-db > backup.sql
```

### Step 2: Run Migration

```bash
# Apply migration
supabase migration up

# Or manually
psql -h your-host -U your-user -d your-db -f supabase/migrations/20250106000001_course_content_enhancements.sql
```

### Step 3: Verify Migration

```sql
-- Check if modules table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'modules'
);

-- Check new columns in lessons
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN (
  'subtitle', 'estimated_duration', 'video_quality_options',
  'subtitles', 'video_chapters', 'download_allowed'
);

-- Check lesson_resources table
SELECT COUNT(*) FROM lesson_resources;
```

### Step 4: Update Application Code

#### Update Imports

**Before:**
```typescript
import { Section } from '@/types/course'
```

**After:**
```typescript
import { Module } from '@/types/lesson'
```

#### Update API Calls

**Before:**
```typescript
const response = await fetch(`/api/courses/${id}/sections`)
const { sections } = await response.json()
```

**After:**
```typescript
const response = await fetch(`/api/courses/${id}/modules`)
const { modules } = await response.json()
```

#### Update Component Usage

**Before:**
```tsx
<SectionModal 
  courseId={courseId}
  section={section}
  onSave={handleSave}
/>
```

**After:**
```tsx
<ModuleModal 
  courseId={courseId}
  module={module}
  onSave={handleSave}
/>
```

### Step 5: Deploy Updates

```bash
# Build application
npm run build

# Run tests
npm test

# Deploy
vercel deploy --prod
# or
npm run deploy
```

---

## 🔧 Backward Compatibility

### Database

The migration maintains backward compatibility:

1. **Sections → Modules**
   - All existing section data migrated
   - Foreign keys updated automatically
   - No data loss

2. **Lessons**
   - All existing lessons work as-is
   - New fields are optional (nullable)
   - Default values set for new fields

3. **Views**
   - `sections_with_lessons` → `modules_with_lessons`
   - Old view maintained for compatibility

### API

Backward compatibility maintained:

1. **Old Endpoints** (deprecated but functional)
   - `/api/courses/[id]/sections` → redirects to modules
   - Response format unchanged
   - Will be removed in v2.0

2. **New Endpoints** (recommended)
   - `/api/courses/[id]/modules`
   - Additional fields in response
   - Enhanced functionality

### Components

1. **Old Components** (deprecated)
   - `SectionModal` → still works, imports ModuleModal
   - Will be removed in v2.0

2. **New Components** (recommended)
   - `ModuleModal` - enhanced features
   - Use for new development

---

## 📊 Data Migration

### Migrating Existing Content

#### 1. Add Module Descriptions

```sql
-- Add descriptions to existing modules
UPDATE modules 
SET description = 'Module description here'
WHERE description IS NULL;
```

#### 2. Set Module Status

```sql
-- Set all existing modules to published
UPDATE modules 
SET status = 'published'
WHERE status IS NULL;
```

#### 3. Set Access Types

```sql
-- Set default access type
UPDATE modules 
SET access_type = 'enrolled_only'
WHERE access_type IS NULL;
```

#### 4. Add Lesson Completion Requirements

```sql
-- Set completion requirements based on lesson type
UPDATE lessons 
SET completion_requirement = CASE
  WHEN type = 'video' THEN 'auto_video_80'
  WHEN type = 'quiz' THEN 'quiz_pass'
  WHEN type = 'assignment' THEN 'assignment_submit'
  ELSE 'manual'
END
WHERE completion_requirement IS NULL;
```

#### 5. Set Lesson Permissions

```sql
-- Set default permissions
UPDATE lessons 
SET 
  download_allowed = true,
  print_allowed = true,
  can_annotate = false
WHERE download_allowed IS NULL;
```

---

## 🧪 Testing Migration

### Test Checklist

- [ ] Database migration completed without errors
- [ ] All modules visible in admin panel
- [ ] All lessons accessible
- [ ] New lesson types can be created
- [ ] Resources can be added to lessons
- [ ] Student progress tracking works
- [ ] Video quality selector works
- [ ] Image galleries display correctly
- [ ] Text lessons render properly
- [ ] Resources download correctly

### Test Queries

```sql
-- Count modules
SELECT COUNT(*) FROM modules;

-- Count lessons by type
SELECT type, COUNT(*) 
FROM lessons 
GROUP BY type;

-- Count resources
SELECT COUNT(*) FROM lesson_resources;

-- Check for null values in required fields
SELECT COUNT(*) 
FROM modules 
WHERE status IS NULL 
OR access_type IS NULL;

-- Verify foreign keys
SELECT COUNT(*) 
FROM lessons l
LEFT JOIN modules m ON l.module_id = m.id
WHERE m.id IS NULL;
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Migration fails with foreign key error

**Solution:**
```sql
-- Temporarily disable foreign key checks
SET session_replication_role = 'replica';

-- Run migration
\i supabase/migrations/20250106000001_course_content_enhancements.sql

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
```

#### Issue: Modules not showing in UI

**Solution:**
1. Clear browser cache
2. Check API response in Network tab
3. Verify RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'modules';
```

#### Issue: Lessons missing after migration

**Solution:**
```sql
-- Check if lessons exist
SELECT COUNT(*) FROM lessons;

-- Check module_id references
SELECT l.id, l.title, l.module_id, m.id as module_exists
FROM lessons l
LEFT JOIN modules m ON l.module_id = m.id
WHERE m.id IS NULL;
```

#### Issue: Resources not accessible

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'lesson_resources';

-- Verify resource URLs
SELECT id, resource_name, resource_url 
FROM lesson_resources 
WHERE resource_url IS NULL OR resource_url = '';
```

---

## 🔄 Rollback Plan

If migration fails, rollback using backup:

### Option 1: Restore from Backup

```bash
# Restore full database
psql -h your-host -U your-user -d your-db < backup.sql
```

### Option 2: Revert Migration

```sql
-- Rename modules back to sections
ALTER TABLE modules RENAME TO sections;

-- Update foreign keys
ALTER TABLE lessons RENAME COLUMN module_id TO section_id;

-- Drop new columns
ALTER TABLE lessons 
DROP COLUMN subtitle,
DROP COLUMN estimated_duration,
DROP COLUMN video_quality_options,
DROP COLUMN subtitles,
DROP COLUMN video_chapters,
DROP COLUMN download_allowed,
DROP COLUMN print_allowed,
DROP COLUMN can_annotate,
DROP COLUMN completion_requirement,
DROP COLUMN enable_discussion,
DROP COLUMN scheduled_publish_at,
DROP COLUMN access_type;

-- Drop new table
DROP TABLE lesson_resources;
```

---

## 📈 Performance Optimization

### After Migration

1. **Rebuild Indexes**
```sql
REINDEX TABLE modules;
REINDEX TABLE lessons;
REINDEX TABLE lesson_resources;
```

2. **Update Statistics**
```sql
ANALYZE modules;
ANALYZE lessons;
ANALYZE lesson_resources;
```

3. **Vacuum Tables**
```sql
VACUUM ANALYZE modules;
VACUUM ANALYZE lessons;
VACUUM ANALYZE lesson_resources;
```

---

## 📝 Post-Migration Tasks

### 1. Update Documentation

- [ ] Update API documentation
- [ ] Update user guides
- [ ] Update developer guides
- [ ] Update video tutorials

### 2. Notify Users

- [ ] Send email to teachers about new features
- [ ] Send email to students about improvements
- [ ] Update changelog
- [ ] Post announcement

### 3. Monitor System

- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Track user feedback
- [ ] Monitor database performance

### 4. Deprecation Timeline

- **v1.0** (Current): Both old and new APIs work
- **v1.5** (3 months): Deprecation warnings added
- **v2.0** (6 months): Old APIs removed

---

## 🆘 Support

### Getting Help

**For Developers:**
- GitHub Issues: https://github.com/your-repo/issues
- Developer Slack: #dev-support
- Email: dev-support@school.com

**For Administrators:**
- Admin Portal: /admin/support
- Email: admin-support@school.com
- Phone: 1-800-SCHOOL

**For Teachers:**
- Help Center: /help
- Email: teacher-support@school.com
- Live Chat: Available 9am-5pm

---

## 📚 Additional Resources

- [User Guide](/docs/user-guides/course-content-enhancement-guide.md)
- [API Reference](/docs/developer-guides/course-content-api-reference.md)
- [Database Schema](/supabase/migrations/20250106000001_course_content_enhancements.sql)
- [Type Definitions](/types/lesson.ts)

---

**Last Updated**: January 6, 2025  
**Version**: 1.0  
**Migration Version**: 20250106000001
