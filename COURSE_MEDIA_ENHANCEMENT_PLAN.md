# Course Media Enhancement - Implementation Plan

## Overview
Comprehensive upgrade to course media handling with multiple banner sizes, promotional videos, demo lessons, and image galleries.

## Phase 1: Database Schema Updates

### 1.1 Migration File
Create: `supabase/migrations/20250105000001_course_media_enhancements.sql`

**New Columns in `courses` table:**
- `banner_desktop_url` - Desktop banner (1920x600px)
- `banner_mobile_url` - Mobile banner (800x400px)
- `card_banner_url` - Course card banner (400x250px)
- `featured_banner_url` - Featured card banner (600x400px)
- `promo_video_url` - Main promotional video
- `promo_video_thumbnail` - Custom video thumbnail
- `promo_video_title` - Video title for SEO
- `promo_video_description` - Video description
- `promo_video_duration` - Video duration in seconds

**New Table: `course_media_gallery`**
- Stores multiple images, videos, and demo lessons
- Supports free preview lessons
- Includes metadata (title, description, captions, alt text)
- Display ordering support

### 1.2 Storage Buckets
Update storage structure for organized media:
```
courses/
  [course-id]/
    thumbnail/
    banners/
    videos/
    demos/
    gallery/
```

## Phase 2: Media Optimization Library

### 2.1 Create: `lib/media/optimize.ts`
**Features:**
- Image compression (WebP conversion)
- Multiple size generation (thumbnail, medium, large)
- Responsive srcset generation
- Video metadata extraction
- Video thumbnail generation
- Aspect ratio validation

### 2.2 Create: `lib/media/upload.ts`
**Features:**
- Chunked upload for large files
- Progress tracking
- File validation
- Storage path management
- Error handling

## Phase 3: Enhanced File Upload Component

### 3.1 Update: `components/common/FileUpload.tsx`
**New Features:**
- Image cropping tool
- Aspect ratio presets
- Compression preview
- Drag-to-reorder
- Multiple file support
- Progress indicators

### 3.2 Create: `components/common/ImageCropper.tsx`
**Features:**
- Interactive crop tool
- Preset aspect ratios
- Zoom controls
- Preview before save

## Phase 4: Media Manager Component

### 4.1 Create: `components/teacher/course-builder/MediaManager.tsx`
**Sections:**
1. Main Thumbnail (enhanced)
2. Banners Upload (desktop, mobile, card, featured)
3. Promotional Videos
4. Demo Lessons
5. Image Gallery

### 4.2 Create Sub-components:
- `BannerUploader.tsx` - Multi-size banner management
- `VideoManager.tsx` - Video upload with metadata
- `DemoLessonSelector.tsx` - Select/upload demo lessons
- `GalleryManager.tsx` - Multiple image management

## Phase 5: API Routes

### 5.1 Create: `app/api/courses/[id]/media/route.ts`
**Endpoints:**
- POST - Upload media
- GET - List all media
- DELETE - Remove media
- PATCH - Update media metadata

### 5.2 Create: `app/api/courses/[id]/media/optimize/route.ts`
**Endpoints:**
- POST - Optimize and compress media
- Generate responsive sizes
- Extract metadata

### 5.3 Update Existing Routes:
- `app/api/teacher/courses/upload-image/route.ts`
- `app/api/teacher/courses/upload-video/route.ts`

## Phase 6: Type Definitions

### 6.1 Update: `types/course.ts`
Add new media-related types:
```typescript
interface CourseBanners {
  desktop?: string
  mobile?: string
  card?: string
  featured?: string
}

interface PromoVideo {
  url: string
  thumbnail?: string
  title?: string
  description?: string
  duration?: number
  provider?: 'upload' | 'youtube' | 'vimeo' | 'wistia'
}

interface CourseMediaItem {
  id: string
  type: 'image' | 'video' | 'demo_video'
  url: string
  thumbnail?: string
  title?: string
  description?: string
  caption?: string
  altText?: string
  order: number
  isFreePreview?: boolean
  duration?: number
}
```

## Phase 7: Integration with Course Builder

### 7.1 Update: `components/teacher/course-builder/BasicInfoForm.tsx`
- Add enhanced thumbnail upload
- Add banner upload section

### 7.2 Create New Step (Optional):
- Add "Media & Assets" step between Basic Info and Curriculum
- Comprehensive media management in one place

## Implementation Priority

### High Priority (Phase 1):
1. ✅ Database migration
2. ✅ Basic media optimization library
3. ✅ Enhanced thumbnail upload
4. ✅ Banner upload (desktop, mobile, card)

### Medium Priority (Phase 2):
5. ✅ Promotional video enhancements
6. ✅ Demo lesson selector
7. ✅ API routes for media management

### Low Priority (Phase 3):
8. ✅ Image gallery
9. ✅ Advanced cropping tools
10. ✅ Video thumbnail generation

## File Structure

```
lib/
  media/
    optimize.ts          # Image/video optimization
    upload.ts            # Upload utilities
    validation.ts        # File validation
    storage.ts           # Storage path management

components/
  common/
    FileUpload.tsx       # Enhanced file upload
    ImageCropper.tsx     # Image cropping tool
    MediaPreview.tsx     # Media preview component
  
  teacher/
    course-builder/
      MediaManager.tsx           # Main media manager
      BannerUploader.tsx         # Banner management
      VideoManager.tsx           # Video management
      DemoLessonSelector.tsx     # Demo lesson selection
      GalleryManager.tsx         # Image gallery

app/
  api/
    courses/
      [id]/
        media/
          route.ts               # Media CRUD
          optimize/
            route.ts             # Media optimization

supabase/
  migrations/
    20250105000001_course_media_enhancements.sql
```

## Testing Strategy

1. **Unit Tests:**
   - Media optimization functions
   - File validation
   - Upload utilities

2. **Integration Tests:**
   - Media upload flow
   - Banner generation
   - Video processing

3. **E2E Tests:**
   - Complete media management workflow
   - Course creation with media
   - Media display on course pages

## Rollout Plan

### Week 1: Foundation
- Database migration
- Media optimization library
- Basic API routes

### Week 2: Components
- Enhanced file upload
- Media manager component
- Banner uploader

### Week 3: Integration
- Integrate with course builder
- Video management
- Demo lessons

### Week 4: Polish
- Image gallery
- Advanced features
- Testing and bug fixes

## Success Metrics

- ✅ All media types supported
- ✅ Automatic optimization working
- ✅ Responsive images generated
- ✅ Upload success rate > 95%
- ✅ Media load time < 2s
- ✅ Storage usage optimized (WebP conversion)

## Next Steps

1. Review and approve plan
2. Create database migration
3. Build media optimization library
4. Implement enhanced file upload
5. Create media manager component
6. Test and iterate
