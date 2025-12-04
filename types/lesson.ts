/**
 * Lesson and Module type definitions for enhanced course content system
 */

// ============================================================================
// MODULE TYPES (formerly sections)
// ============================================================================

/**
 * Module status options
 */
export const MODULE_STATUS = ['draft', 'published', 'archived'] as const
export type ModuleStatus = typeof MODULE_STATUS[number]

/**
 * Module access type options
 */
export const MODULE_ACCESS_TYPES = ['free_preview', 'enrolled_only', 'locked'] as const
export type ModuleAccessType = typeof MODULE_ACCESS_TYPES[number]

/**
 * Enhanced module (formerly section) structure
 */
export interface Module {
  id: string
  course_id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  order_index: number
  duration_minutes?: number | null // Auto-calculated from lessons
  prerequisites?: string[] | null // Array of prerequisite module IDs
  status: ModuleStatus
  access_type: ModuleAccessType
  created_at: string
  updated_at: string
}

/**
 * Module insert type
 */
export interface ModuleInsert {
  course_id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  order_index: number
  prerequisites?: string[] | null
  status?: ModuleStatus
  access_type?: ModuleAccessType
}

/**
 * Module update type
 */
export interface ModuleUpdate {
  title?: string
  description?: string | null
  thumbnail_url?: string | null
  order_index?: number
  prerequisites?: string[] | null
  status?: ModuleStatus
  access_type?: ModuleAccessType
}

// ============================================================================
// LESSON TYPES
// ============================================================================

/**
 * Lesson type options (enhanced with new types)
 */
export const LESSON_TYPES = [
  'video',
  'document',
  'text',      // NEW
  'image',     // NEW
  'quiz',
  'assignment',
  'live_class',
  'mixed'      // NEW
] as const
export type LessonType = typeof LESSON_TYPES[number]

/**
 * Lesson access type options
 */
export const LESSON_ACCESS_TYPES = ['free_preview', 'enrolled_only', 'prerequisite'] as const
export type LessonAccessType = typeof LESSON_ACCESS_TYPES[number]

/**
 * Completion requirement options
 */
export const COMPLETION_REQUIREMENTS = [
  'manual',           // Student marks as complete
  'auto_video_80',    // Auto-complete when video watched 80%+
  'auto_document',    // Auto-complete when document read
  'quiz_pass',        // Must pass quiz
  'assignment_submit' // Must submit assignment
] as const
export type CompletionRequirement = typeof COMPLETION_REQUIREMENTS[number]

/**
 * Video quality options
 */
export interface VideoQualityOptions {
  '1080p'?: string | null
  '720p'?: string | null
  '480p'?: string | null
  '360p'?: string | null
  original?: string | null
}

/**
 * Video subtitle/caption
 */
export interface VideoSubtitle {
  language: string
  label: string
  url: string
  is_default?: boolean
}

/**
 * Video chapter/timestamp
 */
export interface VideoChapter {
  time: string // Format: "00:05:30"
  title: string
  description?: string
}

/**
 * Enhanced lesson structure
 */
export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  subtitle?: string | null
  description?: string | null
  type: LessonType
  content_url?: string | null
  order_index: number
  duration_minutes?: number | null
  estimated_duration?: number | null // For text lessons (reading time)
  
  // Video enhancements
  video_quality_options?: VideoQualityOptions | null
  subtitles?: VideoSubtitle[] | null
  video_chapters?: VideoChapter[] | null
  
  // Document enhancements
  download_allowed: boolean
  print_allowed: boolean
  can_annotate: boolean
  
  // Access and completion
  access_type: LessonAccessType
  completion_requirement: CompletionRequirement
  enable_discussion: boolean
  scheduled_publish_at?: string | null
  
  // Metadata
  is_free_preview: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string | null
}

/**
 * Lesson insert type
 */
export interface LessonInsert {
  module_id: string
  course_id: string
  title: string
  subtitle?: string | null
  description?: string | null
  type: LessonType
  content_url?: string | null
  order_index: number
  duration_minutes?: number | null
  estimated_duration?: number | null
  video_quality_options?: VideoQualityOptions | null
  subtitles?: VideoSubtitle[] | null
  video_chapters?: VideoChapter[] | null
  download_allowed?: boolean
  print_allowed?: boolean
  can_annotate?: boolean
  access_type?: LessonAccessType
  completion_requirement?: CompletionRequirement
  enable_discussion?: boolean
  scheduled_publish_at?: string | null
  is_free_preview?: boolean
  is_published?: boolean
  created_by?: string | null
}

/**
 * Lesson update type
 */
export interface LessonUpdate {
  title?: string
  subtitle?: string | null
  description?: string | null
  type?: LessonType
  content_url?: string | null
  order_index?: number
  duration_minutes?: number | null
  estimated_duration?: number | null
  video_quality_options?: VideoQualityOptions | null
  subtitles?: VideoSubtitle[] | null
  video_chapters?: VideoChapter[] | null
  download_allowed?: boolean
  print_allowed?: boolean
  can_annotate?: boolean
  access_type?: LessonAccessType
  completion_requirement?: CompletionRequirement
  enable_discussion?: boolean
  scheduled_publish_at?: string | null
  is_free_preview?: boolean
  is_published?: boolean
}

// ============================================================================
// LESSON RESOURCE TYPES
// ============================================================================

/**
 * Resource type options
 */
export const RESOURCE_TYPES = ['pdf', 'document', 'image', 'link', 'code', 'other'] as const
export type ResourceType = typeof RESOURCE_TYPES[number]

/**
 * Lesson resource
 */
export interface LessonResource {
  id: string
  lesson_id: string
  resource_type: ResourceType
  resource_name: string
  resource_url?: string | null
  resource_description?: string | null
  file_size?: number | null
  can_download: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Lesson resource insert type
 */
export interface LessonResourceInsert {
  lesson_id: string
  resource_type: ResourceType
  resource_name: string
  resource_url?: string | null
  resource_description?: string | null
  file_size?: number | null
  can_download?: boolean
  display_order?: number
}

/**
 * Lesson resource update type
 */
export interface LessonResourceUpdate {
  resource_type?: ResourceType
  resource_name?: string
  resource_url?: string | null
  resource_description?: string | null
  file_size?: number | null
  can_download?: boolean
  display_order?: number
}

// ============================================================================
// TEXT LESSON TYPES
// ============================================================================

/**
 * Text lesson content structure
 */
export interface TextLessonContent {
  content: string // Rich text HTML or JSON
  word_count?: number
  reading_time_minutes?: number
  has_images?: boolean
  has_videos?: boolean
  has_code_blocks?: boolean
}

// ============================================================================
// IMAGE LESSON TYPES
// ============================================================================

/**
 * Image lesson item
 */
export interface ImageLessonItem {
  id: string
  url: string
  title?: string
  description?: string
  caption?: string
  alt_text?: string
  width?: number
  height?: number
  order_index: number
}

/**
 * Image lesson content structure
 */
export interface ImageLessonContent {
  images: ImageLessonItem[]
  layout?: 'grid' | 'carousel' | 'masonry'
  allow_zoom?: boolean
  allow_download?: boolean
}

// ============================================================================
// MIXED CONTENT LESSON TYPES
// ============================================================================

/**
 * Mixed content block types
 */
export const MIXED_CONTENT_BLOCK_TYPES = [
  'text',
  'image',
  'video',
  'document',
  'code',
  'quote',
  'callout'
] as const
export type MixedContentBlockType = typeof MIXED_CONTENT_BLOCK_TYPES[number]

/**
 * Mixed content block
 */
export interface MixedContentBlock {
  id: string
  type: MixedContentBlockType
  content: any // Type-specific content
  order_index: number
}

/**
 * Mixed content lesson structure
 */
export interface MixedContentLesson {
  blocks: MixedContentBlock[]
}

// ============================================================================
// LESSON WITH RESOURCES
// ============================================================================

/**
 * Lesson with all related data
 */
export interface LessonWithResources extends Lesson {
  resources?: LessonResource[]
  module?: Module
}

// ============================================================================
// MODULE WITH LESSONS
// ============================================================================

/**
 * Module with all lessons
 */
export interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Module form data
 */
export interface ModuleFormData {
  title: string
  description?: string
  thumbnail_url?: string
  prerequisites?: string[]
  status: ModuleStatus
  access_type: ModuleAccessType
}

/**
 * Lesson form data
 */
export interface LessonFormData {
  title: string
  subtitle?: string
  description?: string
  type: LessonType
  content_url?: string
  duration_minutes?: number
  estimated_duration?: number
  video_quality_options?: VideoQualityOptions
  subtitles?: VideoSubtitle[]
  video_chapters?: VideoChapter[]
  download_allowed: boolean
  print_allowed: boolean
  can_annotate: boolean
  access_type: LessonAccessType
  completion_requirement: CompletionRequirement
  enable_discussion: boolean
  scheduled_publish_at?: string
  is_free_preview: boolean
  is_published: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Duration calculation result
 */
export interface DurationCalculation {
  total_minutes: number
  hours: number
  minutes: number
  formatted: string // e.g., "2 hours 30 minutes"
}

/**
 * Reading time calculation
 */
export interface ReadingTimeCalculation {
  word_count: number
  reading_time_minutes: number
  formatted: string // e.g., "5 min read"
}

/**
 * Lesson completion status
 */
export interface LessonCompletionStatus {
  lesson_id: string
  user_id: string
  is_completed: boolean
  progress_percentage: number
  completed_at?: string | null
  time_spent_minutes?: number
}

/**
 * Module progress
 */
export interface ModuleProgress {
  module_id: string
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  estimated_time_remaining_minutes: number
}
