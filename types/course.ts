/**
 * Course-specific type definitions and interfaces
 */

import { Database } from './database'

// Extract course types from database
export type Course = Database['public']['Tables']['courses']['Row']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

// Extract course category types from database
export type CourseCategoryRow = Database['public']['Tables']['course_categories']['Row']
export type CourseCategoryInsert = Database['public']['Tables']['course_categories']['Insert']
export type CourseCategoryUpdate = Database['public']['Tables']['course_categories']['Update']

/**
 * Course highlight with optional icon
 */
export interface CourseHighlight {
  text: string
  icon?: string
}

/**
 * Enhanced course data for form handling
 */
export interface EnhancedCourseData {
  // Existing fields
  title: string
  slug: string
  description: string
  category: string
  grade_level: string
  subject: string
  thumbnail_url: string | null
  intro_video_url: string
  learning_objectives: string[]
  prerequisites: string[]
  difficulty: string
  price: number
  payment_model: string
  duration_minutes: number
  
  // New fields
  subtitle: string
  language: string
  age_groups: string[]
  student_types: string[]
  highlights: CourseHighlight[]
  outcomes: string[]
}

/**
 * Category form data for creation/update
 */
export interface CategoryFormData {
  name: string
  description: string
  icon: File | null
  color: string
}

/**
 * Available language options
 */
export const AVAILABLE_LANGUAGES = [
  'English',
  'Urdu',
  'Arabic',
  'Hindi',
  'Other'
] as const

export type AvailableLanguage = typeof AVAILABLE_LANGUAGES[number]

/**
 * Language options for select dropdown
 */
export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Other', label: 'Other' }
] as const

/**
 * Available age group options
 */
export const AGE_GROUPS = [
  '3-5 years',
  '6-8 years',
  '9-12 years',
  '13-15 years',
  '16-18 years',
  'Adults'
] as const

export type AgeGroup = typeof AGE_GROUPS[number]

/**
 * Available student type options
 */
export const STUDENT_TYPE_VALUES = [
  'online_school',
  'spoken_english',
  'tuition'
] as const

export type StudentTypeOption = typeof STUDENT_TYPE_VALUES[number]

/**
 * Student type display labels
 */
export const STUDENT_TYPE_LABELS: Record<StudentTypeOption, string> = {
  online_school: 'Online School Students',
  spoken_english: 'Spoken English Learners',
  tuition: 'Tuition Students'
}

/**
 * Student types for select dropdown
 */
export const STUDENT_TYPES = [
  { value: 'online_school', label: 'Online School Students', description: 'Full curriculum courses' },
  { value: 'spoken_english', label: 'Spoken English Learners', description: 'Language learning courses' },
  { value: 'tuition', label: 'Tuition Students', description: 'Subject-specific tutoring' }
] as const

/**
 * Grade level options
 */
export const GRADE_LEVEL_VALUES = [
  'Pre-Nursery',
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Spoken English - All Ages',
  'Tuition - Custom'
] as const

export type GradeLevel = typeof GRADE_LEVEL_VALUES[number]

/**
 * Grade levels for select dropdown
 */
export const GRADE_LEVELS = [
  { value: 'pre-nursery', label: 'Pre-Nursery' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'lkg', label: 'LKG' },
  { value: 'ukg', label: 'UKG' },
  { value: 'grade-1', label: 'Grade 1' },
  { value: 'grade-2', label: 'Grade 2' },
  { value: 'grade-3', label: 'Grade 3' },
  { value: 'grade-4', label: 'Grade 4' },
  { value: 'grade-5', label: 'Grade 5' },
  { value: 'grade-6', label: 'Grade 6' },
  { value: 'grade-7', label: 'Grade 7' },
  { value: 'grade-8', label: 'Grade 8' },
  { value: 'grade-9', label: 'Grade 9' },
  { value: 'grade-10', label: 'Grade 10' },
  { value: 'spoken-english-all', label: 'Spoken English - All Ages' },
  { value: 'tuition-custom', label: 'Tuition - Custom' }
] as const

/**
 * Difficulty levels
 */
export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced'
] as const

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

/**
 * Icon options for course highlights
 */
export const HIGHLIGHT_ICONS = [
  'book',
  'video',
  'certificate',
  'trophy',
  'star',
  'check-circle',
  'award',
  'target',
  'users',
  'clock',
  'calendar',
  'globe',
  'lightbulb',
  'graduation-cap',
  'bookmark'
] as const

export type HighlightIcon = typeof HIGHLIGHT_ICONS[number]

// ============================================================================
// COURSE MEDIA TYPES
// ============================================================================

/**
 * Course banner URLs for different sizes
 */
export interface CourseBanners {
  desktop?: string | null
  mobile?: string | null
  card?: string | null
  featured?: string | null
}

/**
 * Promotional video information
 */
export interface PromoVideo {
  url: string
  thumbnail?: string | null
  title?: string | null
  description?: string | null
  duration?: number | null
  provider?: 'upload' | 'youtube' | 'vimeo' | 'wistia' | 'google_drive'
}

/**
 * Course media gallery item
 */
export interface CourseMediaItem {
  id: string
  course_id: string
  media_type: 'image' | 'video' | 'demo_video'
  media_url: string
  thumbnail_url?: string | null
  title?: string | null
  description?: string | null
  caption?: string | null
  alt_text?: string | null
  display_order: number
  is_free_preview: boolean
  duration_seconds?: number | null
  file_size_bytes?: number | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  created_at: string
  updated_at: string
  created_by?: string | null
}

/**
 * Course media gallery insert type
 */
export interface CourseMediaInsert {
  course_id: string
  media_type: 'image' | 'video' | 'demo_video'
  media_url: string
  thumbnail_url?: string | null
  title?: string | null
  description?: string | null
  caption?: string | null
  alt_text?: string | null
  display_order?: number
  is_free_preview?: boolean
  duration_seconds?: number | null
  file_size_bytes?: number | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  created_by?: string | null
}

/**
 * Course with all media
 */
export interface CourseWithMedia extends Course {
  banners?: CourseBanners
  promo_video?: PromoVideo
  gallery?: CourseMediaItem[]
  demo_videos?: CourseMediaItem[]
}

/**
 * Media upload progress
 */
export interface MediaUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  url?: string
  error?: string
}

/**
 * Banner upload state
 */
export interface BannerUploadState {
  desktop?: MediaUploadProgress
  mobile?: MediaUploadProgress
  card?: MediaUploadProgress
  featured?: MediaUploadProgress
}

/**
 * Media manager state
 */
export interface MediaManagerState {
  thumbnail?: MediaUploadProgress
  banners?: BannerUploadState
  promoVideo?: MediaUploadProgress
  demoVideos?: MediaUploadProgress[]
  gallery?: MediaUploadProgress[]
}
