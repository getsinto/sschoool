# Course Content Enhancement - API Reference

## 📋 Overview

Complete API reference for the Course Content Enhancement System, including modules, lessons, and resources endpoints.

---

## 🔐 Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 📦 Modules API

### GET /api/courses/[id]/modules

Get all modules for a course.

**Parameters:**
- `id` (path): Course ID

**Response:**
```json
{
  "modules": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "title": "Introduction to Programming",
      "description": "Learn the basics...",
      "thumbnail_url": "https://...",
      "order_index": 0,
      "duration_minutes": 120,
      "prerequisites": ["uuid"],
      "status": "published",
      "access_type": "enrolled_only",
      "created_at": "2025-01-06T...",
      "updated_at": "2025-01-06T..."
    }
  ]
}
```

### POST /api/courses/[id]/modules

Create a new module.

**Parameters:**
- `id` (path): Course ID

**Request Body:**
```json
{
  "title": "Module Title",
  "description": "Module description",
  "thumbnail_url": "https://...",
  "order_index": 0,
  "prerequisites": ["uuid"],
  "status": "draft",
  "access_type": "enrolled_only"
}
```

**Response:**
```json
{
  "module": {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Module Title",
    ...
  }
}
```

### GET /api/courses/[id]/modules/[moduleId]

Get a specific module.

**Parameters:**
- `id` (path): Course ID
- `moduleId` (path): Module ID

**Response:**
```json
{
  "module": {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Module Title",
    ...
  }
}
```

### PUT /api/courses/[id]/modules/[moduleId]

Update a module.

**Parameters:**
- `id` (path): Course ID
- `moduleId` (path): Module ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "published"
}
```

**Response:**
```json
{
  "module": {
    "id": "uuid",
    "title": "Updated Title",
    ...
  }
}
```

### DELETE /api/courses/[id]/modules/[moduleId]

Delete a module.

**Parameters:**
- `id` (path): Course ID
- `moduleId` (path): Module ID

**Response:**
```json
{
  "success": true,
  "message": "Module deleted successfully"
}
```

---

## 📝 Lessons API

### GET /api/courses/[id]/lessons

Get all lessons for a course.

**Query Parameters:**
- `module_id` (optional): Filter by module

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "module_id": "uuid",
      "course_id": "uuid",
      "title": "Lesson Title",
      "subtitle": "Lesson subtitle",
      "description": "Lesson description",
      "type": "text",
      "content_url": "https://...",
      "order_index": 0,
      "duration_minutes": 15,
      "estimated_duration": 10,
      "video_quality_options": {
        "1080p": "https://...",
        "720p": "https://...",
        "480p": "https://..."
      },
      "subtitles": [
        {
          "language": "en",
          "label": "English",
          "url": "https://...",
          "is_default": true
        }
      ],
      "video_chapters": [
        {
          "time": "00:05:30",
          "title": "Chapter Title",
          "description": "Chapter description"
        }
      ],
      "download_allowed": true,
      "print_allowed": true,
      "can_annotate": true,
      "access_type": "enrolled_only",
      "completion_requirement": "auto_video_80",
      "enable_discussion": true,
      "scheduled_publish_at": null,
      "is_free_preview": false,
      "is_published": true,
      "created_at": "2025-01-06T...",
      "updated_at": "2025-01-06T..."
    }
  ]
}
```

### POST /api/courses/[id]/lessons

Create a new lesson.

**Request Body:**
```json
{
  "module_id": "uuid",
  "title": "Lesson Title",
  "subtitle": "Lesson subtitle",
  "description": "Lesson description",
  "type": "text",
  "content_url": "https://...",
  "order_index": 0,
  "duration_minutes": 15,
  "download_allowed": true,
  "print_allowed": true,
  "can_annotate": true,
  "access_type": "enrolled_only",
  "completion_requirement": "manual",
  "enable_discussion": true,
  "is_free_preview": false,
  "is_published": true
}
```

**Response:**
```json
{
  "lesson": {
    "id": "uuid",
    "title": "Lesson Title",
    ...
  }
}
```

---

## 📎 Resources API

### GET /api/lessons/[lessonId]/resources

Get all resources for a lesson.

**Parameters:**
- `lessonId` (path): Lesson ID

**Response:**
```json
{
  "resources": [
    {
      "id": "uuid",
      "lesson_id": "uuid",
      "resource_type": "pdf",
      "resource_name": "Workbook.pdf",
      "resource_url": "https://...",
      "resource_description": "Course workbook",
      "file_size": 2048000,
      "can_download": true,
      "display_order": 0,
      "created_at": "2025-01-06T...",
      "updated_at": "2025-01-06T..."
    }
  ]
}
```

### POST /api/lessons/[lessonId]/resources

Add a resource to a lesson.

**Parameters:**
- `lessonId` (path): Lesson ID

**Request Body:**
```json
{
  "resource_type": "pdf",
  "resource_name": "Workbook.pdf",
  "resource_url": "https://...",
  "resource_description": "Course workbook",
  "file_size": 2048000,
  "can_download": true,
  "display_order": 0
}
```

**Response:**
```json
{
  "resource": {
    "id": "uuid",
    "lesson_id": "uuid",
    "resource_name": "Workbook.pdf",
    ...
  }
}
```

### PUT /api/lessons/[lessonId]/resources/[resourceId]

Update a resource.

**Parameters:**
- `lessonId` (path): Lesson ID
- `resourceId` (path): Resource ID

**Request Body:**
```json
{
  "resource_name": "Updated Workbook.pdf",
  "resource_description": "Updated description",
  "can_download": false
}
```

**Response:**
```json
{
  "resource": {
    "id": "uuid",
    "resource_name": "Updated Workbook.pdf",
    ...
  }
}
```

### DELETE /api/lessons/[lessonId]/resources/[resourceId]

Delete a resource.

**Parameters:**
- `lessonId` (path): Lesson ID
- `resourceId` (path): Resource ID

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

---

## 📊 Progress Tracking

### POST /api/student/lessons/[lessonId]/progress

Update lesson progress.

**Parameters:**
- `lessonId` (path): Lesson ID

**Request Body:**
```json
{
  "progress_percentage": 75,
  "time_spent_minutes": 10,
  "is_completed": false
}
```

**Response:**
```json
{
  "progress": {
    "lesson_id": "uuid",
    "user_id": "uuid",
    "progress_percentage": 75,
    "time_spent_minutes": 10,
    "is_completed": false,
    "updated_at": "2025-01-06T..."
  }
}
```

### GET /api/student/courses/[courseId]/progress

Get course progress.

**Parameters:**
- `courseId` (path): Course ID

**Response:**
```json
{
  "progress": {
    "course_id": "uuid",
    "total_lessons": 50,
    "completed_lessons": 25,
    "progress_percentage": 50,
    "time_spent_minutes": 300,
    "estimated_time_remaining_minutes": 300,
    "modules": [
      {
        "module_id": "uuid",
        "total_lessons": 10,
        "completed_lessons": 5,
        "progress_percentage": 50
      }
    ]
  }
}
```

---

## 🔧 Utility Functions

### Duration Calculator

Calculate total duration for modules and courses.

```typescript
import { calculateModuleDuration, calculateCourseDuration } from '@/lib/lessons/duration-calculator'

// Calculate module duration
const moduleDuration = await calculateModuleDuration(moduleId)
// Returns: { total_minutes: 120, hours: 2, minutes: 0, formatted: "2 hours" }

// Calculate course duration
const courseDuration = await calculateCourseDuration(courseId)
// Returns: { total_minutes: 480, hours: 8, minutes: 0, formatted: "8 hours" }
```

### Completion Tracker

Track and verify lesson completion.

```typescript
import { 
  checkLessonCompletion,
  markLessonComplete,
  getModuleProgress
} from '@/lib/lessons/completion-tracker'

// Check if lesson is complete
const isComplete = await checkLessonCompletion(lessonId, userId)

// Mark lesson as complete
await markLessonComplete(lessonId, userId, {
  progress_percentage: 100,
  time_spent_minutes: 15
})

// Get module progress
const progress = await getModuleProgress(moduleId, userId)
```

---

## 📝 Type Definitions

### Module Types

```typescript
interface Module {
  id: string
  course_id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  order_index: number
  duration_minutes?: number | null
  prerequisites?: string[] | null
  status: 'draft' | 'published' | 'archived'
  access_type: 'free_preview' | 'enrolled_only' | 'locked'
  created_at: string
  updated_at: string
}
```

### Lesson Types

```typescript
interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  subtitle?: string | null
  description?: string | null
  type: 'video' | 'document' | 'text' | 'image' | 'quiz' | 'assignment' | 'live_class' | 'mixed'
  content_url?: string | null
  order_index: number
  duration_minutes?: number | null
  estimated_duration?: number | null
  video_quality_options?: VideoQualityOptions | null
  subtitles?: VideoSubtitle[] | null
  video_chapters?: VideoChapter[] | null
  download_allowed: boolean
  print_allowed: boolean
  can_annotate: boolean
  access_type: 'free_preview' | 'enrolled_only' | 'prerequisite'
  completion_requirement: 'manual' | 'auto_video_80' | 'auto_document' | 'quiz_pass' | 'assignment_submit'
  enable_discussion: boolean
  scheduled_publish_at?: string | null
  is_free_preview: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}
```

### Resource Types

```typescript
interface LessonResource {
  id: string
  lesson_id: string
  resource_type: 'pdf' | 'document' | 'image' | 'link' | 'code' | 'other'
  resource_name: string
  resource_url?: string | null
  resource_description?: string | null
  file_size?: number | null
  can_download: boolean
  display_order: number
  created_at: string
  updated_at: string
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR`: Server error

### Example Error Responses

```json
{
  "error": "Module not found",
  "code": "NOT_FOUND",
  "details": {
    "module_id": "uuid"
  }
}
```

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fields": {
      "title": "Title is required",
      "order_index": "Must be a positive number"
    }
  }
}
```

---

## 🔒 Permissions

### Module Permissions

- **Create**: Admin or assigned teacher
- **Read**: Admin, assigned teacher, or enrolled student
- **Update**: Admin or assigned teacher
- **Delete**: Admin only

### Lesson Permissions

- **Create**: Admin or assigned teacher
- **Read**: Based on access_type and enrollment
- **Update**: Admin or assigned teacher
- **Delete**: Admin or assigned teacher

### Resource Permissions

- **Create**: Admin or assigned teacher
- **Read**: Based on lesson access and enrollment
- **Update**: Admin or assigned teacher
- **Delete**: Admin or assigned teacher
- **Download**: Based on can_download and enrollment

---

## 📈 Rate Limiting

All API endpoints are rate-limited:

- **Authenticated**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

---

## 🧪 Testing

### Example cURL Requests

**Get Modules:**
```bash
curl -X GET \
  https://api.school.com/api/courses/uuid/modules \
  -H 'Authorization: Bearer <token>'
```

**Create Module:**
```bash
curl -X POST \
  https://api.school.com/api/courses/uuid/modules \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "New Module",
    "description": "Module description",
    "status": "draft",
    "access_type": "enrolled_only"
  }'
```

**Add Resource:**
```bash
curl -X POST \
  https://api.school.com/api/lessons/uuid/resources \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "resource_type": "pdf",
    "resource_name": "Workbook.pdf",
    "resource_url": "https://...",
    "can_download": true
  }'
```

---

## 📚 Additional Resources

- [User Guide](/docs/user-guides/course-content-enhancement-guide.md)
- [Migration Guide](/docs/developer-guides/course-content-migration-guide.md)
- [Type Definitions](/types/lesson.ts)
- [Database Schema](/supabase/migrations/20250106000001_course_content_enhancements.sql)

---

**Last Updated**: January 6, 2025  
**Version**: 1.0  
**API Version**: v1
