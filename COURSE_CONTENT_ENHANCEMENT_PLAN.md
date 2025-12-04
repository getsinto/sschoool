# Course Content/Lessons Enhancement - Implementation Plan

## 📋 Overview

Comprehensive enhancement of the existing course content system to support:
- Enhanced module/chapter structure (formerly sections)
- New lesson types (Text, Image)
- Video enhancements (quality options, subtitles, chapters)
- Document enhancements (multiple types, permissions)
- Lesson resources system
- Advanced access control and completion requirements

## 🎯 Scope

### Current System
- Sections (basic structure)
- Lessons: Video, Document, Quiz, Assignment, Live Class

### Enhanced System
- **Modules/Chapters** (enhanced sections with rich metadata)
- **Lesson Types**: Video, Document, Text (NEW), Image (NEW), Quiz, Assignment, Live Class, Mixed Content (NEW)
- **Video Enhancements**: Multiple quality options, subtitles, chapters, resources
- **Document Enhancements**: Multiple formats, download/print permissions, annotations
- **Lesson Resources**: Attachments, links, downloadable materials
- **Access Control**: Free preview, enrolled only, prerequisite-based
- **Completion Tracking**: Multiple completion requirements

## 📊 Implementation Phases

### Phase 1: Database Schema (Priority: HIGH)
**Estimated Time**: 2-3 hours

1. **Rename sections to modules**
2. **Add module enhancements**
3. **Add lesson enhancements**
4. **Create lesson_resources table**
5. **Add indexes and constraints**

### Phase 2: Type Definitions (Priority: HIGH)
**Estimated Time**: 1-2 hours

1. **Update course types**
2. **Add module types**
3. **Add lesson types**
4. **Add resource types**

### Phase 3: Core Components (Priority: HIGH)
**Estimated Time**: 4-6 hours

1. **TextLessonEditor** - Rich text editor for text lessons
2. **ImageLessonGallery** - Multiple image upload and management
3. **VideoEnhancementsForm** - Quality, subtitles, chapters
4. **LessonResourcesManager** - Add/manage resources
5. **ModuleSettingsForm** - Enhanced module configuration

### Phase 4: Enhanced Existing Components (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

1. **Update LessonModal** - Add new lesson types
2. **Update VideoUploader** - Add quality options, subtitles
3. **Update DocumentUploader** - Add permissions, multiple formats
4. **Update SectionModal** → **ModuleModal** - Enhanced fields
5. **Update DragDropCurriculum** - Enhanced reordering

### Phase 5: API Routes (Priority: HIGH)
**Estimated Time**: 3-4 hours

1. **Module CRUD operations**
2. **Lesson CRUD with new types**
3. **Lesson resources endpoints**
4. **Video quality/subtitle upload**
5. **Completion tracking**

### Phase 6: Student Interface (Priority: MEDIUM)
**Estimated Time**: 2-3 hours

1. **Enhanced video player** - Quality selector, subtitles, chapters
2. **Text lesson viewer** - Rich content display
3. **Image gallery viewer** - Lightbox, zoom
4. **Resource downloads** - Access control

### Phase 7: Testing & Documentation (Priority: MEDIUM)
**Estimated Time**: 2-3 hours

1. **Unit tests**
2. **Integration tests**
3. **User documentation**
4. **Migration guide**

## 📁 Files to Create/Modify

### Database (1 file)
- `supabase/migrations/20250106000001_course_content_enhancements.sql` (NEW)

### Type Definitions (2 files)
- `types/course.ts` (UPDATE)
- `types/lesson.ts` (NEW)

### Core Components (5 NEW files)
- `components/teacher/course-builder/TextLessonEditor.tsx`
- `components/teacher/course-builder/ImageLessonGallery.tsx`
- `components/teacher/course-builder/VideoEnhancementsForm.tsx`
- `components/teacher/course-builder/LessonResourcesManager.tsx`
- `components/teacher/course-builder/ModuleSettingsForm.tsx`

### Updated Components (5 files)
- `components/teacher/course-builder/LessonModal.tsx` (UPDATE)
- `components/teacher/course-builder/VideoUploader.tsx` (UPDATE)
- `components/teacher/course-builder/DocumentUploader.tsx` (UPDATE)
- `components/teacher/course-builder/SectionModal.tsx` → `ModuleModal.tsx` (RENAME + UPDATE)
- `components/teacher/course-builder/DragDropCurriculum.tsx` (UPDATE)

### API Routes (6 NEW files)
- `app/api/courses/[id]/modules/route.ts`
- `app/api/courses/[id]/modules/[moduleId]/route.ts`
- `app/api/courses/[id]/lessons/[lessonId]/resources/route.ts`
- `app/api/courses/[id]/lessons/[lessonId]/quality/route.ts`
- `app/api/courses/[id]/lessons/[lessonId]/subtitles/route.ts`
- `app/api/courses/[id]/lessons/[lessonId]/chapters/route.ts`

### Student Components (4 NEW files)
- `components/student/learning/EnhancedVideoPlayer.tsx`
- `components/student/learning/TextLessonViewer.tsx`
- `components/student/learning/ImageGalleryViewer.tsx`
- `components/student/learning/LessonResourcesList.tsx`

### Utilities (2 NEW files)
- `lib/lessons/duration-calculator.ts`
- `lib/lessons/completion-tracker.ts`

**Total**: ~25 files (10 new, 15 updated)

## 🗄️ Database Schema Changes

### 1. Rename sections to modules
```sql
ALTER TABLE sections RENAME TO modules;
ALTER TABLE lessons RENAME COLUMN section_id TO module_id;
```

### 2. Module enhancements
```sql
ALTER TABLE modules ADD COLUMN:
- description TEXT
- thumbnail_url TEXT
- duration_minutes INTEGER (auto-calculated)
- prerequisites UUID[] (array of module IDs)
- status TEXT DEFAULT 'draft'
- access_type TEXT DEFAULT 'enrolled_only'
```

### 3. Lesson enhancements
```sql
ALTER TABLE lessons ADD COLUMN:
- subtitle TEXT
- estimated_duration INTEGER
- video_quality_options JSONB
- subtitles JSONB
- video_chapters JSONB
- download_allowed BOOLEAN
- print_allowed BOOLEAN
- can_annotate BOOLEAN
- completion_requirement TEXT
- enable_discussion BOOLEAN
- scheduled_publish_at TIMESTAMP
- access_type TEXT
```

### 4. New table: lesson_resources
```sql
CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),
  resource_type TEXT,
  resource_name TEXT,
  resource_url TEXT,
  resource_description TEXT,
  file_size BIGINT,
  can_download BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMP
)
```

## 🎨 New Lesson Types

### 1. Text Lesson
- Rich text editor (TipTap/Lexical)
- Formatting, lists, links, code blocks
- Embedded images/videos
- Estimated reading time
- Attachments

### 2. Image Lesson
- Multiple image upload
- Gallery view with captions
- Zoom and pan
- Download options
- Use cases: Diagrams, infographics, step-by-step guides

### 3. Mixed Content Lesson
- Combination of text, images, videos
- Flexible layout
- Interactive elements

## 🔧 Key Features

### Module/Chapter Enhancements
- ✅ Rich description with formatting
- ✅ Module thumbnail
- ✅ Auto-calculated duration
- ✅ Prerequisites system
- ✅ Status management (draft, published, archived)
- ✅ Access control (free preview, enrolled, locked)

### Video Enhancements
- ✅ Multiple quality options (1080p, 720p, 480p, 360p)
- ✅ Subtitles/captions (SRT/VTT, multiple languages)
- ✅ Video chapters/timestamps
- ✅ Attached resources
- ✅ Teacher notes section

### Document Enhancements
- ✅ Multiple formats (PDF, DOCX, PPTX, XLSX, images)
- ✅ Download permissions
- ✅ Print permissions
- ✅ Annotation permissions
- ✅ Multiple documents per lesson

### Lesson Resources
- ✅ Multiple resource types (PDF, document, image, link, code)
- ✅ Per-resource download permissions
- ✅ Organized by type
- ✅ Reusable across lessons

### Access Control
- ✅ Free preview (anyone can access)
- ✅ Enrolled students only
- ✅ Prerequisite-based unlocking

### Completion Requirements
- ✅ Manual completion
- ✅ Auto-complete (video 80%+, document read)
- ✅ Quiz pass required
- ✅ Assignment submission required

## 📈 Success Metrics

- ✅ All lesson types supported
- ✅ Video quality options working
- ✅ Subtitles display correctly
- ✅ Resources downloadable
- ✅ Prerequisites enforced
- ✅ Completion tracking accurate
- ✅ Duration calculations correct
- ✅ Backward compatible with existing courses

## ⚠️ Considerations

### Backward Compatibility
- Existing sections → modules (rename)
- Existing lessons remain functional
- New fields are optional
- Migration script for existing data

### Performance
- Lazy load video qualities
- Optimize subtitle loading
- Cache duration calculations
- Index prerequisite queries

### Storage
- Multiple video qualities increase storage
- Subtitle files are small
- Resource files need quota management

## 🚀 Deployment Strategy

### Phase 1: Database Migration
1. Run migration on staging
2. Test with existing data
3. Verify backward compatibility
4. Deploy to production

### Phase 2: Backend APIs
1. Deploy API routes
2. Test CRUD operations
3. Verify permissions

### Phase 3: Teacher Interface
1. Deploy enhanced components
2. Test lesson creation
3. Verify all lesson types

### Phase 4: Student Interface
1. Deploy enhanced viewers
2. Test lesson consumption
3. Verify completion tracking

### Phase 5: Testing & Rollout
1. Beta test with select teachers
2. Gather feedback
3. Fix issues
4. Full rollout

## 📝 Next Steps

1. **Review and approve** this plan
2. **Start with Phase 1**: Database schema
3. **Implement incrementally**: One phase at a time
4. **Test thoroughly**: Each phase before moving forward
5. **Document**: As we build

## 💡 Recommendations

### Start Small
- Implement Text Lesson first (simpler)
- Then Image Lesson
- Then Video enhancements
- Finally, all advanced features

### Prioritize
- **Must Have**: Text lessons, basic video enhancements
- **Should Have**: Image lessons, subtitles, resources
- **Nice to Have**: Video chapters, advanced prerequisites

### Test Early
- Create test courses with new features
- Get teacher feedback
- Iterate based on usage

---

**Status**: Planning Complete - Ready for Implementation
**Estimated Total Time**: 17-25 hours
**Complexity**: High
**Priority**: Medium-High
**Last Updated**: January 5, 2025

