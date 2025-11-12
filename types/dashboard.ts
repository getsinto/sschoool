/**
 * Dashboard Types and Interfaces
 * Type definitions for dashboard statistics, analytics, and widgets
 */

import { ChartDataPoint, TimeSeriesDataPoint, StatCard } from './common'

// ============================================================================
// ADMIN DASHBOARD TYPES
// ============================================================================

/**
 * Admin dashboard overview statistics
 */
export interface AdminDashboardStats {
  users: {
    total: number
    active: number
    new_this_month: number
    by_role: {
      admin: number
      teacher: number
      student: number
      parent: number
    }
  }
  courses: {
    total: number
    published: number
    draft: number
    total_enrollments: number
  }
  revenue: {
    total: number
    this_month: number
    last_month: number
    growth_percentage: number
  }
  engagement: {
    active_students: number
    avg_completion_rate: number
    total_lessons_completed: number
    total_assignments_submitted: number
  }
}

/**
 * Admin dashboard charts data
 */
export interface AdminDashboardCharts {
  revenue_trend: TimeSeriesDataPoint[]
  enrollment_trend: TimeSeriesDataPoint[]
  user_growth: TimeSeriesDataPoint[]
  course_completion_rates: ChartDataPoint[]
  popular_courses: Array<{
    course_id: string
    course_title: string
    enrollments: number
    revenue: number
  }>
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string
  type: 'enrollment' | 'payment' | 'completion' | 'registration' | 'submission'
  user_id: string
  user_name: string
  user_avatar: string | null
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// ============================================================================
// TEACHER DASHBOARD TYPES
// ============================================================================

/**
 * Teacher dashboard overview statistics
 */
export interface TeacherDashboardStats {
  courses: {
    total: number
    published: number
    draft: number
    total_students: number
  }
  students: {
    total: number
    active: number
    avg_progress: number
  }
  assessments: {
    pending_submissions: number
    graded_this_week: number
    avg_score: number
  }
  engagement: {
    total_views: number
    avg_completion_rate: number
    student_satisfaction: number | null
  }
}

/**
 * Teacher course performance
 */
export interface TeacherCoursePerformance {
  course_id: string
  course_title: string
  total_students: number
  active_students: number
  avg_progress: number
  completion_rate: number
  avg_rating: number | null
  revenue: number
  pending_submissions: number
}

/**
 * Teacher upcoming classes
 */
export interface TeacherUpcomingClass {
  id: string
  title: string
  course_title: string
  scheduled_at: string
  duration_minutes: number
  platform: 'zoom' | 'google_meet'
  meeting_url: string | null
  enrolled_students: number
}

/**
 * Teacher recent submissions
 */
export interface TeacherRecentSubmission {
  id: string
  type: 'assignment' | 'quiz'
  title: string
  student_id: string
  student_name: string
  student_avatar: string | null
  submitted_at: string
  status: 'pending' | 'graded' | 'late'
  score: number | null
}

// ============================================================================
// STUDENT DASHBOARD TYPES
// ============================================================================

/**
 * Student dashboard overview statistics
 */
export interface StudentDashboardStats {
  courses: {
    enrolled: number
    in_progress: number
    completed: number
    avg_progress: number
  }
  learning: {
    total_hours: number
    this_week_hours: number
    lessons_completed: number
    current_streak: number
  }
  assessments: {
    quizzes_taken: number
    avg_quiz_score: number
    assignments_submitted: number
    avg_assignment_score: number
  }
  achievements: {
    certificates_earned: number
    badges_earned: number
    points_earned: number
  }
}

/**
 * Student course progress
 */
export interface StudentCourseProgress {
  course_id: string
  course_title: string
  course_thumbnail: string | null
  instructor_name: string
  enrollment_date: string
  last_accessed: string | null
  progress_percentage: number
  status: 'active' | 'completed' | 'suspended'
  next_lesson: {
    id: string
    title: string
    type: string
  } | null
  total_lessons: number
  completed_lessons: number
}

/**
 * Student upcoming deadlines
 */
export interface StudentUpcomingDeadline {
  id: string
  type: 'assignment' | 'quiz' | 'live_class'
  title: string
  course_title: string
  due_date: string
  status: 'pending' | 'submitted' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

/**
 * Student learning activity
 */
export interface StudentLearningActivity {
  date: string
  lessons_completed: number
  time_spent_minutes: number
  quizzes_taken: number
  assignments_submitted: number
}

/**
 * Student achievement
 */
export interface StudentAchievement {
  id: string
  type: 'certificate' | 'badge' | 'milestone'
  title: string
  description: string
  icon_url: string | null
  earned_at: string
  course_title?: string
}

// ============================================================================
// PARENT DASHBOARD TYPES
// ============================================================================

/**
 * Parent dashboard overview statistics
 */
export interface ParentDashboardStats {
  children: {
    total: number
    active: number
  }
  courses: {
    total_enrollments: number
    avg_progress: number
  }
  performance: {
    avg_quiz_score: number
    avg_assignment_score: number
    total_certificates: number
  }
  engagement: {
    total_hours_this_week: number
    avg_daily_time: number
    attendance_rate: number
  }
}

/**
 * Child performance summary
 */
export interface ChildPerformanceSummary {
  student_id: string
  student_name: string
  student_avatar: string | null
  enrolled_courses: number
  avg_progress: number
  avg_quiz_score: number
  avg_assignment_score: number
  attendance_rate: number
  last_active: string | null
  recent_achievements: number
}

/**
 * Parent notification
 */
export interface ParentNotification {
  id: string
  student_id: string
  student_name: string
  type: 'grade' | 'attendance' | 'achievement' | 'deadline' | 'message'
  title: string
  message: string
  timestamp: string
  is_read: boolean
  action_url?: string
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Course analytics
 */
export interface CourseAnalytics {
  course_id: string
  overview: {
    total_enrollments: number
    active_students: number
    completion_rate: number
    avg_rating: number | null
    total_revenue: number
  }
  engagement: {
    total_views: number
    avg_time_spent: number
    lesson_completion_rate: number
    quiz_completion_rate: number
    assignment_submission_rate: number
  }
  performance: {
    avg_quiz_score: number
    avg_assignment_score: number
    pass_rate: number
    dropout_rate: number
  }
  trends: {
    enrollment_trend: TimeSeriesDataPoint[]
    completion_trend: TimeSeriesDataPoint[]
    engagement_trend: TimeSeriesDataPoint[]
  }
}

/**
 * Student analytics
 */
export interface StudentAnalytics {
  student_id: string
  overview: {
    total_courses: number
    completed_courses: number
    avg_progress: number
    total_certificates: number
  }
  performance: {
    avg_quiz_score: number
    avg_assignment_score: number
    overall_grade: number
    class_rank: number | null
  }
  engagement: {
    total_hours: number
    avg_daily_time: number
    login_streak: number
    last_active: string
  }
  trends: {
    progress_trend: TimeSeriesDataPoint[]
    performance_trend: TimeSeriesDataPoint[]
    engagement_trend: TimeSeriesDataPoint[]
  }
}

/**
 * Revenue analytics
 */
export interface RevenueAnalytics {
  overview: {
    total_revenue: number
    this_month: number
    last_month: number
    growth_rate: number
  }
  by_period: {
    daily: TimeSeriesDataPoint[]
    weekly: TimeSeriesDataPoint[]
    monthly: TimeSeriesDataPoint[]
  }
  by_course: Array<{
    course_id: string
    course_title: string
    revenue: number
    enrollments: number
    avg_price: number
  }>
  by_payment_method: ChartDataPoint[]
  refunds: {
    total: number
    rate: number
    trend: TimeSeriesDataPoint[]
  }
}

// ============================================================================
// WIDGET TYPES
// ============================================================================

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string
  type: 'stat' | 'chart' | 'list' | 'calendar' | 'progress'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  data: any
  refresh_interval?: number
  is_visible: boolean
}

/**
 * Dashboard layout
 */
export interface DashboardLayout {
  user_id: string
  role: string
  widgets: DashboardWidget[]
  updated_at: string
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/**
 * Report configuration
 */
export interface ReportConfig {
  id: string
  name: string
  type: 'student' | 'course' | 'financial' | 'engagement'
  filters: Record<string, any>
  date_range: {
    start: string
    end: string
  }
  format: 'pdf' | 'excel' | 'csv'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

/**
 * Generated report
 */
export interface GeneratedReport {
  id: string
  config_id: string
  file_url: string
  file_size: number
  generated_at: string
  expires_at: string
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

/**
 * Period comparison
 */
export interface PeriodComparison {
  current: number
  previous: number
  change: number
  change_percentage: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * Performance comparison
 */
export interface PerformanceComparison {
  metric: string
  current_value: number
  average_value: number
  percentile: number
  rank: number | null
}
