/**
 * Live Class Types and Interfaces
 * Comprehensive type definitions for live classes, meetings, and attendance
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum PlatformType {
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

// ============================================================================
// LIVE CLASS INTERFACE
// ============================================================================

export interface LiveClass {
  id: string
  course_id: string
  teacher_id: string
  title: string
  description: string | null
  platform: PlatformType
  meeting_url: string | null
  meeting_password: string | null
  scheduled_at: string
  duration_minutes: number
  recording_url: string | null
  attendance_count: number
  status: ClassStatus
  created_at: string
  updated_at?: string
}

/**
 * Live class with course details
 */
export interface LiveClassWithCourse extends LiveClass {
  course: {
    id: string
    title: string
    thumbnail_url: string | null
  }
}

/**
 * Live class with teacher details
 */
export interface LiveClassWithTeacher extends LiveClass {
  teacher: {
    id: string
    user_id: string
    user: {
      full_name: string | null
      profile_pic: string | null
    }
  }
}

/**
 * Live class with full details
 */
export interface LiveClassWithDetails extends LiveClass {
  course: {
    id: string
    title: string
    thumbnail_url: string | null
  }
  teacher: {
    id: string
    user_id: string
    user: {
      full_name: string | null
      profile_pic: string | null
    }
  }
  enrolled_students_count: number
  attendees_count: number
}

// ============================================================================
// ATTENDANCE INTERFACE
// ============================================================================

export interface ClassAttendance {
  id: string
  live_class_id: string
  student_id: string
  status: AttendanceStatus
  joined_at: string | null
  left_at: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Attendance with student details
 */
export interface ClassAttendanceWithStudent extends ClassAttendance {
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
 * Attendance record for reports
 */
export interface AttendanceRecord {
  student_id: string
  student_name: string
  student_email: string
  total_classes: number
  attended_classes: number
  absent_classes: number
  late_classes: number
  attendance_rate: number
  total_duration_minutes: number
}

// ============================================================================
// MEETING PARTICIPANT INTERFACE
// ============================================================================

export interface MeetingParticipant {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
  role: 'host' | 'co-host' | 'participant'
  joined_at: string
  left_at: string | null
  duration_minutes: number
  is_active: boolean
}

// ============================================================================
// RECORDING INTERFACE
// ============================================================================

export interface ClassRecording {
  id: string
  live_class_id: string
  recording_url: string
  recording_id: string // Platform-specific ID
  file_size: number | null
  duration_minutes: number | null
  thumbnail_url: string | null
  is_available: boolean
  expires_at: string | null
  created_at: string
}

// ============================================================================
// FORM TYPES (for creating/updating)
// ============================================================================

/**
 * Live class creation form data
 */
export type CreateLiveClassInput = Omit<
  LiveClass,
  'id' | 'attendance_count' | 'recording_url' | 'created_at' | 'updated_at'
>

/**
 * Live class update form data
 */
export type UpdateLiveClassInput = Partial<
  Omit<LiveClass, 'id' | 'course_id' | 'teacher_id' | 'created_at' | 'updated_at'>
>

/**
 * Attendance creation form data
 */
export type CreateAttendanceInput = {
  live_class_id: string
  student_id: string
  status: AttendanceStatus
  joined_at?: string
  left_at?: string
  notes?: string
}

/**
 * Attendance update form data
 */
export type UpdateAttendanceInput = Partial<
  Omit<ClassAttendance, 'id' | 'live_class_id' | 'student_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const liveClassSchema = z.object({
  course_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().nullable(),
  platform: z.nativeEnum(PlatformType),
  meeting_url: z.string().url().nullable(),
  meeting_password: z.string().max(50).nullable(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().min(15).max(480), // 15 min to 8 hours
  status: z.nativeEnum(ClassStatus).default(ClassStatus.SCHEDULED),
})

export const attendanceSchema = z.object({
  live_class_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus),
  joined_at: z.string().datetime().optional(),
  left_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
})

export const updateAttendanceSchema = attendanceSchema.partial().omit({
  live_class_id: true,
  student_id: true,
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Live class list item for tables/cards
 */
export type LiveClassListItem = Pick<
  LiveClass,
  | 'id'
  | 'title'
  | 'scheduled_at'
  | 'duration_minutes'
  | 'platform'
  | 'status'
  | 'attendance_count'
>

/**
 * Live class card data
 */
export interface LiveClassCard extends LiveClassListItem {
  course_title: string
  teacher_name: string
  enrolled_students: number
  is_upcoming: boolean
  time_until_start?: number // minutes
}

/**
 * Live class schedule
 */
export interface ClassSchedule {
  date: string
  classes: Array<{
    live_class: LiveClass
    course_title: string
    teacher_name: string
    enrolled_students: number
  }>
}

/**
 * Live class statistics
 */
export interface LiveClassStats {
  total_classes: number
  scheduled_classes: number
  completed_classes: number
  cancelled_classes: number
  avg_attendance_rate: number
  total_duration_minutes: number
  upcoming_classes: number
}

/**
 * Teacher class statistics
 */
export interface TeacherClassStats {
  teacher_id: string
  total_classes: number
  completed_classes: number
  avg_attendance_rate: number
  total_students_taught: number
  avg_class_duration: number
  total_recordings: number
}

/**
 * Student class statistics
 */
export interface StudentClassStats {
  student_id: string
  total_classes: number
  attended_classes: number
  missed_classes: number
  attendance_rate: number
  total_duration_minutes: number
  upcoming_classes: number
}

/**
 * Class reminder
 */
export interface ClassReminder {
  live_class_id: string
  title: string
  scheduled_at: string
  platform: PlatformType
  meeting_url: string | null
  minutes_until_start: number
  reminder_sent: boolean
}

/**
 * Class notification
 */
export interface ClassNotification {
  type: 'starting_soon' | 'started' | 'ended' | 'cancelled' | 'rescheduled'
  live_class: LiveClass
  message: string
  action_url: string
}

/**
 * Bulk attendance input
 */
export interface BulkAttendanceInput {
  live_class_id: string
  attendances: Array<{
    student_id: string
    status: AttendanceStatus
    notes?: string
  }>
}

/**
 * Class analytics
 */
export interface ClassAnalytics {
  live_class_id: string
  total_enrolled: number
  total_attended: number
  attendance_rate: number
  avg_duration_minutes: number
  peak_concurrent_users: number
  engagement_score: number
  recording_views: number
}

/**
 * Platform meeting info
 */
export interface PlatformMeetingInfo {
  platform: PlatformType
  meeting_id: string
  meeting_url: string
  password: string | null
  host_url: string | null
  join_url: string
  dial_in_numbers?: string[]
}

/**
 * Class feedback
 */
export interface ClassFeedback {
  id: string
  live_class_id: string
  student_id: string
  rating: number // 1-5
  comment: string | null
  created_at: string
}

/**
 * Class feedback summary
 */
export interface ClassFeedbackSummary {
  live_class_id: string
  total_responses: number
  avg_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  positive_comments: number
  negative_comments: number
}
