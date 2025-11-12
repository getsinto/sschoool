/**
 * Certificate and Announcement Types
 * Type definitions for certificates, announcements, and achievements
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum TargetAudience {
  ALL = 'all',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  PARENTS = 'parents',
}

export enum CertificateStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  REVOKED = 'revoked',
}

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ============================================================================
// CERTIFICATE INTERFACE
// ============================================================================

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  certificate_number: string
  issue_date: string
  certificate_url: string | null
  verification_code: string
  created_at: string
}

/**
 * Certificate with student details
 */
export interface CertificateWithStudent extends Certificate {
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

/**
 * Certificate with course details
 */
export interface CertificateWithCourse extends Certificate {
  course: {
    id: string
    title: string
    category: string
    thumbnail_url: string | null
  }
}

/**
 * Certificate with full details
 */
export interface CertificateWithDetails extends Certificate {
  student: {
    id: string
    user_id: string
    user: {
      full_name: string | null
      email: string
      profile_pic: string | null
    }
  }
  course: {
    id: string
    title: string
    category: string
    duration_minutes: number
    thumbnail_url: string | null
  }
  instructor_name: string | null
}

// ============================================================================
// ANNOUNCEMENT INTERFACE
// ============================================================================

export interface Announcement {
  id: string
  created_by: string
  title: string
  message: string
  target_audience: TargetAudience
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Announcement with creator details
 */
export interface AnnouncementWithCreator extends Announcement {
  creator: {
    id: string
    full_name: string | null
    role: string
    profile_pic: string | null
  }
}

/**
 * Announcement with read status
 */
export interface AnnouncementWithReadStatus extends Announcement {
  is_read: boolean
  read_at: string | null
}

// ============================================================================
// ACHIEVEMENT INTERFACE
// ============================================================================

export interface Achievement {
  id: string
  name: string
  description: string
  icon_url: string | null
  badge_url: string | null
  criteria: AchievementCriteria
  points: number
  is_active: boolean
  created_at: string
}

/**
 * Achievement criteria
 */
export interface AchievementCriteria {
  type: 'course_completion' | 'quiz_score' | 'assignment_score' | 'streak' | 'total_hours' | 'custom'
  threshold: number
  course_id?: string
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
}

/**
 * Student achievement (earned)
 */
export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  earned_at: string
  progress: number // 0-100
  metadata?: Record<string, any>
}

/**
 * Student achievement with details
 */
export interface StudentAchievementWithDetails extends StudentAchievement {
  achievement: Achievement
}

// ============================================================================
// BADGE INTERFACE
// ============================================================================

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  category: 'academic' | 'participation' | 'achievement' | 'special'
  requirements: string[]
  points: number
  is_active: boolean
  created_at: string
}

/**
 * Student badge (earned)
 */
export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  earned_at: string
  display_order: number
  is_featured: boolean
}

/**
 * Student badge with details
 */
export interface StudentBadgeWithDetails extends StudentBadge {
  badge: Badge
}

// ============================================================================
// FORM TYPES (for creating/updating)
// ============================================================================

/**
 * Certificate creation form data
 */
export type CreateCertificateInput = {
  student_id: string
  course_id: string
}

/**
 * Certificate verification input
 */
export type VerifyCertificateInput = {
  certificate_number?: string
  verification_code?: string
}

/**
 * Announcement creation form data
 */
export type CreateAnnouncementInput = Omit<
  Announcement,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Announcement update form data
 */
export type UpdateAnnouncementInput = Partial<
  Omit<Announcement, 'id' | 'created_by' | 'created_at' | 'updated_at'>
>

/**
 * Achievement creation form data
 */
export type CreateAchievementInput = Omit<Achievement, 'id' | 'created_at'>

/**
 * Achievement update form data
 */
export type UpdateAchievementInput = Partial<Omit<Achievement, 'id' | 'created_at'>>

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const certificateSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
})

export const verifyCertificateSchema = z.object({
  certificate_number: z.string().optional(),
  verification_code: z.string().optional(),
}).refine(
  (data) => data.certificate_number || data.verification_code,
  {
    message: 'Either certificate number or verification code is required',
  }
)

export const announcementSchema = z.object({
  created_by: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  target_audience: z.nativeEnum(TargetAudience),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().nullable(),
})

export const achievementCriteriaSchema = z.object({
  type: z.enum(['course_completion', 'quiz_score', 'assignment_score', 'streak', 'total_hours', 'custom']),
  threshold: z.number().min(0),
  course_id: z.string().uuid().optional(),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional(),
})

export const achievementSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  icon_url: z.string().url().nullable(),
  badge_url: z.string().url().nullable(),
  criteria: achievementCriteriaSchema,
  points: z.number().min(0).max(1000),
  is_active: z.boolean().default(true),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Certificate list item
 */
export type CertificateListItem = Pick<
  Certificate,
  'id' | 'certificate_number' | 'issue_date' | 'verification_code'
>

/**
 * Certificate verification result
 */
export interface CertificateVerificationResult {
  is_valid: boolean
  certificate?: CertificateWithDetails
  error?: string
}

/**
 * Certificate statistics
 */
export interface CertificateStats {
  total_issued: number
  issued_this_month: number
  issued_this_year: number
  by_course: Array<{
    course_id: string
    course_title: string
    count: number
  }>
  by_month: Array<{
    month: string
    count: number
  }>
}

/**
 * Announcement list item
 */
export type AnnouncementListItem = Pick<
  Announcement,
  'id' | 'title' | 'target_audience' | 'is_published' | 'published_at' | 'created_at'
>

/**
 * Announcement statistics
 */
export interface AnnouncementStats {
  total_announcements: number
  published_announcements: number
  draft_announcements: number
  total_views: number
  avg_read_rate: number
  by_audience: {
    all: number
    students: number
    teachers: number
    parents: number
  }
}

/**
 * Achievement progress
 */
export interface AchievementProgress {
  achievement_id: string
  achievement_name: string
  achievement_description: string
  icon_url: string | null
  current_progress: number
  required_progress: number
  progress_percentage: number
  is_earned: boolean
  earned_at: string | null
  points: number
}

/**
 * Student achievements summary
 */
export interface StudentAchievementsSummary {
  student_id: string
  total_achievements: number
  total_points: number
  total_badges: number
  recent_achievements: StudentAchievementWithDetails[]
  featured_badges: StudentBadgeWithDetails[]
  progress: AchievementProgress[]
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number
  student_id: string
  student_name: string
  student_avatar: string | null
  total_points: number
  total_achievements: number
  total_badges: number
  level: number
}

/**
 * Certificate template data
 */
export interface CertificateTemplateData {
  student_name: string
  course_title: string
  completion_date: string
  certificate_number: string
  instructor_name: string | null
  duration_hours: number
  grade?: string
  skills?: string[]
}

/**
 * Announcement notification
 */
export interface AnnouncementNotification {
  announcement_id: string
  title: string
  message: string
  target_audience: TargetAudience
  published_at: string
  created_by_name: string
  priority: AnnouncementPriority
}

/**
 * Certificate share data
 */
export interface CertificateShareData {
  certificate_id: string
  certificate_url: string
  verification_url: string
  share_text: string
  social_media_links: {
    linkedin: string
    twitter: string
    facebook: string
  }
}

/**
 * Achievement milestone
 */
export interface AchievementMilestone {
  id: string
  name: string
  description: string
  required_achievements: string[]
  reward_points: number
  reward_badge_id: string | null
  is_unlocked: boolean
  unlocked_at: string | null
}
