/**
 * Course Materials & Resources Type Definitions
 * Includes: Worksheets, Resources, Enhanced Assignments, Enhanced Quizzes
 */

// ============================================================================
// WORKSHEETS TYPES
// ============================================================================

/**
 * Difficulty levels for worksheets
 */
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

/**
 * Worksheet submission status
 */
export const WORKSHEET_SUBMISSION_STATUS = [
  'submitted',
  'graded',
  'resubmit_requested',
  'late'
] as const
export type WorksheetSubmissionStatus = typeof WORKSHEET_SUBMISSION_STATUS[number]

/**
 * Worksheet interface
 */
export interface Worksheet {
  id: string
  course_id: string
  module_id?: string | null
  lesson_id?: string | null
  
  // Basic info
  title: string
  description?: string | null
  instructions?: string | null
  
  // Difficulty and timing
  difficulty_level?: DifficultyLevel | null
  estimated_minutes?: number | null
  
  // Files
  worksheet_file_url: string
  worksheet_file_type?: string | null
  worksheet_file_size?: number | null
  answer_key_url?: string | null
  answer_key_file_type?: string | null
  
  // Settings
  requires_submission: boolean
  download_allowed: boolean
  print_allowed: boolean
  max_grade: number
  
  // Organization
  display_order: number
  tags?: string[] | null
  
  // Metadata
  created_by?: string | null
  created_at: string
  updated_at: string
}

/**
 * Worksheet insert type
 */
export interface WorksheetInsert {
  course_id: string
  module_id?: string | null
  lesson_id?: string | null
  title: string
  description?: string | null
  instructions?: string | null
  difficulty_level?: DifficultyLevel | null
  estimated_minutes?: number | null
  worksheet_file_url: string
  worksheet_file_type?: string | null
  worksheet_file_size?: number | null
  answer_key_url?: string | null
  answer_key_file_type?: string | null
  requires_submission?: boolean
  download_allowed?: boolean
  print_allowed?: boolean
  max_grade?: number
  display_order?: number
  tags?: string[] | null
  created_by?: string | null
}

/**
 * Worksheet update type
 */
export interface WorksheetUpdate {
  title?: string
  description?: string | null
  instructions?: string | null
  difficulty_level?: DifficultyLevel | null
  estimated_minutes?: number | null
  worksheet_file_url?: string
  answer_key_url?: string | null
  requires_submission?: boolean
  download_allowed?: boolean
  print_allowed?: boolean
  max_grade?: number
  display_order?: number
  tags?: string[] | null
}

/**
 * Worksheet submission interface
 */
export interface WorksheetSubmission {
  id: string
  worksheet_id: string
  student_id: string
  
  // Submission
  submission_file_url?: string | null
  submission_file_type?: string | null
  submission_file_size?: number | null
  submission_notes?: string | null
  submitted_at: string
  
  // Grading
  grade?: number | null
  max_grade: number
  teacher_feedback?: string | null
  status: WorksheetSubmissionStatus
  
  // Grading metadata
  graded_at?: string | null
  graded_by?: string | null
  
  // Resubmission tracking
  resubmission_count: number
  is_late: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Worksheet submission insert type
 */
export interface WorksheetSubmissionInsert {
  worksheet_id: string
  student_id: string
  submission_file_url?: string | null
  submission_file_type?: string | null
  submission_file_size?: number | null
  submission_notes?: string | null
}

/**
 * Worksheet with submissions
 */
export interface WorksheetWithSubmissions extends Worksheet {
  submissions?: WorksheetSubmission[]
  submission_count?: number
  graded_count?: number
  average_grade?: number
}

// ============================================================================
// COURSE RESOURCES TYPES
// ============================================================================

/**
 * Resource types
 */
export const RESOURCE_TYPES = [
  'link',
  'file',
  'reference',
  'tool',
  'video',
  'document'
] as const
export type ResourceType = typeof RESOURCE_TYPES[number]

/**
 * Resource categories
 */
export const RESOURCE_CATEGORIES = [
  'required',
  'optional',
  'supplementary',
  'reference'
] as const
export type ResourceCategory = typeof RESOURCE_CATEGORIES[number]

/**
 * Course resource interface
 */
export interface CourseResource {
  id: string
  course_id: string
  module_id?: string | null
  
  // Resource type and category
  resource_type: ResourceType
  resource_category?: ResourceCategory | null
  
  // Basic info
  title: string
  description?: string | null
  
  // Resource location
  resource_url?: string | null
  file_url?: string | null
  file_type?: string | null
  file_size?: number | null
  
  // External resource metadata
  external_platform?: string | null
  thumbnail_url?: string | null
  
  // Access control
  download_allowed: boolean
  requires_enrollment: boolean
  
  // Organization
  display_order: number
  tags?: string[] | null
  
  // Metadata
  created_by?: string | null
  created_at: string
  updated_at: string
}

/**
 * Course resource insert type
 */
export interface CourseResourceInsert {
  course_id: string
  module_id?: string | null
  resource_type: ResourceType
  resource_category?: ResourceCategory | null
  title: string
  description?: string | null
  resource_url?: string | null
  file_url?: string | null
  file_type?: string | null
  file_size?: number | null
  external_platform?: string | null
  thumbnail_url?: string | null
  download_allowed?: boolean
  requires_enrollment?: boolean
  display_order?: number
  tags?: string[] | null
  created_by?: string | null
}

/**
 * Course resource update type
 */
export interface CourseResourceUpdate {
  title?: string
  description?: string | null
  resource_url?: string | null
  file_url?: string | null
  resource_category?: ResourceCategory | null
  download_allowed?: boolean
  requires_enrollment?: boolean
  display_order?: number
  tags?: string[] | null
}

// ============================================================================
// ENHANCED ASSIGNMENTS TYPES
// ============================================================================

/**
 * Assignment types
 */
export const ASSIGNMENT_TYPES = [
  'file',
  'text',
  'video',
  'audio',
  'project',
  'link'
] as const
export type AssignmentType = typeof ASSIGNMENT_TYPES[number]

/**
 * Group formation methods
 */
export const GROUP_FORMATION_METHODS = ['teacher', 'student', 'random'] as const
export type GroupFormationMethod = typeof GROUP_FORMATION_METHODS[number]

/**
 * Rubric criterion
 */
export interface RubricCriterion {
  id: string
  name: string
  description: string
  points: number
  weight: number // 0-1, percentage of total grade
}

/**
 * Assignment rubric
 */
export interface AssignmentRubric {
  criteria: RubricCriterion[]
  total_points: number
}

/**
 * Enhanced assignment interface (extends existing)
 */
export interface EnhancedAssignment {
  // Existing assignment fields...
  id: string
  course_id: string
  title: string
  description?: string | null
  due_date?: string | null
  max_grade: number
  
  // New fields
  assignment_type: AssignmentType
  rubric?: AssignmentRubric | null
  
  // Peer review
  enable_peer_review: boolean
  peer_review_count?: number | null
  peer_review_deadline?: string | null
  
  // Group assignment
  is_group_assignment: boolean
  group_size?: number | null
  group_formation?: GroupFormationMethod | null
  
  // Late submission
  allow_late_submission: boolean
  late_penalty_percentage?: number | null
  late_deadline?: string | null
  
  // File requirements
  allowed_file_types?: string[] | null
  max_file_size?: number | null
  max_files?: number | null
}

/**
 * Assignment group
 */
export interface AssignmentGroup {
  id: string
  assignment_id: string
  group_name: string
  member_ids: string[]
  group_leader_id?: string | null
  submission_id?: string | null
  created_at: string
  updated_at: string
}

/**
 * Peer review
 */
export interface PeerReview {
  id: string
  assignment_id: string
  submission_id: string
  reviewer_id: string
  rating?: number | null // 1-5
  feedback?: string | null
  rubric_scores?: Record<string, number> | null
  status: 'pending' | 'completed' | 'skipped'
  is_anonymous: boolean
  created_at: string
  completed_at?: string | null
}

// ============================================================================
// ENHANCED QUIZZES TYPES
// ============================================================================

/**
 * Question subtypes
 */
export const QUESTION_SUBTYPES = [
  'standard',
  'image_based',
  'audio',
  'hotspot',
  'matching',
  'ordering',
  'fill_blank'
] as const
export type QuestionSubtype = typeof QUESTION_SUBTYPES[number]

/**
 * Media types for questions
 */
export const MEDIA_TYPES = ['image', 'audio', 'video'] as const
export type MediaType = typeof MEDIA_TYPES[number]

/**
 * Quiz section (for timed sections)
 */
export interface QuizSection {
  name: string
  time_limit: number // minutes
  question_ids: string[]
}

/**
 * Enhanced quiz interface (extends existing)
 */
export interface EnhancedQuiz {
  // Existing quiz fields...
  id: string
  course_id: string
  title: string
  description?: string | null
  time_limit?: number | null
  passing_grade: number
  
  // Question bank mode
  question_bank_mode: boolean
  questions_per_attempt?: number | null
  randomize_questions: boolean
  randomize_options: boolean
  
  // Negative marking
  enable_negative_marking: boolean
  negative_marks_value?: number | null
  
  // Partial credit
  enable_partial_credit: boolean
  
  // Timed sections
  enable_timed_sections: boolean
  sections?: QuizSection[] | null
}

/**
 * Hotspot data for hotspot questions
 */
export interface HotspotData {
  image_url: string
  hotspots: Array<{
    x: number
    y: number
    radius: number
    is_correct: boolean
  }>
}

/**
 * Matching pairs data
 */
export interface MatchingPairsData {
  pairs: Array<{
    left: string
    right: string
  }>
}

/**
 * Ordering data
 */
export interface OrderingData {
  correct_order: string[]
}

/**
 * Fill in the blank data
 */
export interface FillBlankData {
  blanks: Array<{
    position: number
    correct_answers: string[]
    case_sensitive?: boolean
  }>
}

/**
 * Enhanced quiz question interface (extends existing)
 */
export interface EnhancedQuizQuestion {
  // Existing question fields...
  id: string
  quiz_id: string
  question_text: string
  question_type: string
  options?: any
  correct_answer?: any
  
  // New fields
  question_weight: number
  media_url?: string | null
  media_type?: MediaType | null
  question_subtype: QuestionSubtype
  additional_data?: HotspotData | MatchingPairsData | OrderingData | FillBlankData | null
}

/**
 * Quiz analytics
 */
export interface QuizAnalytics {
  id: string
  quiz_id: string
  question_id: string
  total_attempts: number
  correct_attempts: number
  incorrect_attempts: number
  average_time_seconds?: number | null
  difficulty_score?: number | null // 0-1
  last_updated: string
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Worksheet form data
 */
export interface WorksheetFormData {
  title: string
  description?: string
  instructions?: string
  difficulty_level?: DifficultyLevel
  estimated_minutes?: number
  worksheet_file_url: string
  answer_key_url?: string
  requires_submission: boolean
  download_allowed: boolean
  print_allowed: boolean
  max_grade: number
  module_id?: string
  lesson_id?: string
  tags?: string[]
}

/**
 * Resource form data
 */
export interface ResourceFormData {
  title: string
  description?: string
  resource_type: ResourceType
  resource_category?: ResourceCategory
  resource_url?: string
  file_url?: string
  external_platform?: string
  download_allowed: boolean
  requires_enrollment: boolean
  module_id?: string
  tags?: string[]
}

/**
 * Rubric form data
 */
export interface RubricFormData {
  criteria: Array<{
    name: string
    description: string
    points: number
    weight: number
  }>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * File upload result
 */
export interface FileUploadResult {
  url: string
  file_type: string
  file_size: number
  file_name: string
}

/**
 * Worksheet statistics
 */
export interface WorksheetStatistics {
  worksheet_id: string
  course_id: string
  title: string
  total_submissions: number
  graded_submissions: number
  average_grade?: number | null
  late_submissions: number
}

/**
 * Course resources summary
 */
export interface CourseResourcesSummary {
  course_id: string
  resource_type: ResourceType
  resource_category?: ResourceCategory | null
  resource_count: number
  total_file_size?: number | null
}

/**
 * Grading result
 */
export interface GradingResult {
  submission_id: string
  grade: number
  feedback?: string
  rubric_scores?: Record<string, number>
}
