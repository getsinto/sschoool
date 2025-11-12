/**
 * Course Types and Interfaces
 * Comprehensive type definitions for courses, sections, lessons, and enrollments
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum CourseCategory {
  ONLINE_SCHOOL = 'online_school',
  SPOKEN_ENGLISH = 'spoken_english',
  TUITION = 'tuition',
}

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum PaymentModel {
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription',
  FREE = 'free',
}

export enum LessonType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  LIVE_CLASS = 'live_class',
}

export enum EmbedPlatform {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  CUSTOM = 'custom',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// ============================================================================
// COURSE INTERFACE
// ============================================================================

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: CourseCategory
  grade_level: string | null
  subject: string | null
  thumbnail_url: string | null
  intro_video_url: string | null
  learning_objectives: string[]
  duration_minutes: number
  difficulty: CourseDifficulty | null
  price: number
  payment_model: PaymentModel
  enrollment_limit: number | null
  validity_days: number
  created_by: string
  is_published: boolean
  views_count: number
  enrollments_count: number
  created_at: string
  updated_at: string
}

/**
 * Course with creator details
 */
export interface CourseWithCreator extends Course {
  creator: {
    id: string
    full_name: string | null
    profile_pic: string | null
  }
}

/**
 * Course with full curriculum
 */
export interface CourseWithCurriculum extends Course {
  sections: SectionWithLessons[]
}

// ============================================================================
// SECTION INTERFACE
// ============================================================================

export interface Section {
  id: string
  course_id: string
  title: string
  order_index: number
  created_at: string
}

/**
 * Section with lessons
 */
export interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

// ============================================================================
// LESSON INTERFACE
// ============================================================================

export interface Lesson {
  id: string
  section_id: string
  title: string
  description: string | null
  lesson_type: LessonType
  content_url: string | null
  embed_url: string | null
  embed_platform: EmbedPlatform | null
  duration_minutes: number
  is_free_preview: boolean
  allow_download: boolean
  is_required: boolean
  order_index: number
  created_at: string
}

/**
 * Lesson with progress tracking
 */
export interface LessonWithProgress extends Lesson {
  progress?: {
    status: ProgressStatus
    watch_percentage: number
    completed_at: string | null
  }
}

// ============================================================================
// DOCUMENT INTERFACE
// ============================================================================

export interface Document {
  id: string
  lesson_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

// ============================================================================
// ENROLLMENT INTERFACE
// ============================================================================

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrollment_date: string
  completion_percentage: number
  status: EnrollmentStatus
  certificate_url: string | null
  payment_id: string | null
  last_accessed_at: string | null
  created_at: string
}

/**
 * Enrollment with course details
 */
export interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

/**
 * Enrollment with student details
 */
export interface EnrollmentWithStudent extends Enrollment {
  student: {
    id: string
    user_id: string
    user: {
      full_name: string | null
      email: string
      profile_pic: string | null
    }
  }
}

// ============================================================================
// PROGRESS TRACKING INTERFACE
// ============================================================================

export interface ProgressTracking {
  id: string
  student_id: string
  lesson_id: string
  status: ProgressStatus
  last_position_seconds: number
  watch_percentage: number
  completed_at: string | null
  updated_at: string
}

// ============================================================================
// FORM TYPES (for creating/updating)
// ============================================================================

/**
 * Course creation form data
 */
export type CreateCourseInput = Omit<
  Course,
  'id' | 'slug' | 'views_count' | 'enrollments_count' | 'created_at' | 'updated_at'
>

/**
 * Course update form data
 */
export type UpdateCourseInput = Partial<
  Omit<Course, 'id' | 'created_by' | 'created_at' | 'updated_at'>
>

/**
 * Section creation form data
 */
export type CreateSectionInput = Omit<Section, 'id' | 'created_at'>

/**
 * Section update form data
 */
export type UpdateSectionInput = Partial<Omit<Section, 'id' | 'course_id' | 'created_at'>>

/**
 * Lesson creation form data
 */
export type CreateLessonInput = Omit<Lesson, 'id' | 'created_at'>

/**
 * Lesson update form data
 */
export type UpdateLessonInput = Partial<Omit<Lesson, 'id' | 'section_id' | 'created_at'>>

/**
 * Enrollment creation form data
 */
export type CreateEnrollmentInput = Pick<Enrollment, 'student_id' | 'course_id' | 'payment_id'>

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').nullable(),
  category: z.nativeEnum(CourseCategory),
  grade_level: z.string().nullable(),
  subject: z.string().nullable(),
  thumbnail_url: z.string().url().nullable(),
  intro_video_url: z.string().url().nullable(),
  learning_objectives: z.array(z.string()).min(1, 'At least one learning objective is required'),
  duration_minutes: z.number().min(0),
  difficulty: z.nativeEnum(CourseDifficulty).nullable(),
  price: z.number().min(0),
  payment_model: z.nativeEnum(PaymentModel),
  enrollment_limit: z.number().positive().nullable(),
  validity_days: z.number().positive().default(365),
  created_by: z.string().uuid(),
  is_published: z.boolean().default(false),
})

export const sectionSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  order_index: z.number().min(0),
})

export const lessonSchema = z.object({
  section_id: z.string().uuid(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().nullable(),
  lesson_type: z.nativeEnum(LessonType),
  content_url: z.string().url().nullable(),
  embed_url: z.string().url().nullable(),
  embed_platform: z.nativeEnum(EmbedPlatform).nullable(),
  duration_minutes: z.number().min(0).default(0),
  is_free_preview: z.boolean().default(false),
  allow_download: z.boolean().default(false),
  is_required: z.boolean().default(true),
  order_index: z.number().min(0),
})

export const enrollmentSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  payment_id: z.string().uuid().nullable(),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Course list item for tables/cards
 */
export type CourseListItem = Pick<
  Course,
  | 'id'
  | 'title'
  | 'slug'
  | 'category'
  | 'thumbnail_url'
  | 'price'
  | 'payment_model'
  | 'difficulty'
  | 'duration_minutes'
  | 'enrollments_count'
  | 'is_published'
>

/**
 * Course card data
 */
export interface CourseCard extends CourseListItem {
  creator_name: string | null
  rating?: number
  reviews_count?: number
}

/**
 * Course statistics
 */
export interface CourseStats {
  total_courses: number
  published_courses: number
  draft_courses: number
  total_enrollments: number
  total_revenue: number
  avg_completion_rate: number
  by_category: {
    online_school: number
    spoken_english: number
    tuition: number
  }
}

/**
 * Course analytics
 */
export interface CourseAnalytics {
  course_id: string
  total_enrollments: number
  active_students: number
  completed_students: number
  avg_completion_percentage: number
  avg_rating: number | null
  total_revenue: number
  views_count: number
  completion_rate: number
  engagement_rate: number
}

/**
 * Student course progress
 */
export interface StudentCourseProgress {
  course_id: string
  course_title: string
  enrollment_date: string
  completion_percentage: number
  status: EnrollmentStatus
  last_accessed_at: string | null
  total_lessons: number
  completed_lessons: number
  current_lesson?: {
    id: string
    title: string
    lesson_type: LessonType
  }
}

/**
 * Course curriculum tree
 */
export interface CourseCurriculumTree {
  course: Course
  sections: Array<{
    section: Section
    lessons: LessonWithProgress[]
    total_duration: number
    completed_count: number
  }>
  total_lessons: number
  total_duration: number
  completion_percentage: number
}
