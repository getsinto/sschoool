export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'
export type StudentType = 'online_school' | 'spoken_english'
export type CourseCategory = 'online_school' | 'spoken_english' | 'tuition'
export type PaymentModel = 'one_time' | 'subscription' | 'free'
export type LessonType = 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
export type PlatformType = 'zoom' | 'google_meet'
export type QuestionType = 'mcq' | 'true_false' | 'short_answer'
export type SubmissionType = 'file' | 'text' | 'both'
export type DiscountType = 'percentage' | 'fixed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type EnrollmentStatus = 'active' | 'completed' | 'suspended'
export type ClassStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SubmissionStatus = 'pending' | 'graded' | 'late'
export type TargetAudience = 'all' | 'students' | 'teachers' | 'parents'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string | null
          last_name: string | null
          date_of_birth: string | null
          gender: string | null
          mobile: string | null
          whatsapp: string | null
          country: string | null
          state: string | null
          city: string | null
          address: string | null
          postal_code: string | null
          id_card_type: string | null
          id_card_url: string | null
          profile_pic: string | null
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          full_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          gender?: string | null
          mobile?: string | null
          whatsapp?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          id_card_type?: string | null
          id_card_url?: string | null
          profile_pic?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          full_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          gender?: string | null
          mobile?: string | null
          whatsapp?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          id_card_type?: string | null
          id_card_url?: string | null
          profile_pic?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          user_id: string
          qualifications: string | null
          field_of_study: string | null
          experience_years: number
          subjects: string[] | null
          bio: string | null
          resume_url: string | null
          is_approved: boolean
          approval_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          qualifications?: string | null
          field_of_study?: string | null
          experience_years?: number
          subjects?: string[] | null
          bio?: string | null
          resume_url?: string | null
          is_approved?: boolean
          approval_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          qualifications?: string | null
          field_of_study?: string | null
          experience_years?: number
          subjects?: string[] | null
          bio?: string | null
          resume_url?: string | null
          is_approved?: boolean
          approval_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          student_type: StudentType
          previous_school: string | null
          grade_level: string | null
          academic_year: string | null
          english_level: string | null
          purpose: string | null
          learning_schedule: string | null
          parent_id: string | null
          enrollment_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          student_type?: StudentType
          previous_school?: string | null
          grade_level?: string | null
          academic_year?: string | null
          english_level?: string | null
          purpose?: string | null
          learning_schedule?: string | null
          parent_id?: string | null
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_type?: StudentType
          previous_school?: string | null
          grade_level?: string | null
          academic_year?: string | null
          english_level?: string | null
          purpose?: string | null
          learning_schedule?: string | null
          parent_id?: string | null
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          user_id: string
          relationship: string | null
          occupation: string | null
          linked_students: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          relationship?: string | null
          occupation?: string | null
          linked_students?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          relationship?: string | null
          occupation?: string | null
          linked_students?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          subtitle: string | null
          category: CourseCategory
          grade_level: string | null
          subject: string | null
          thumbnail_url: string | null
          intro_video_url: string | null
          learning_objectives: string[] | null
          duration_minutes: number
          difficulty: string | null
          price: number
          payment_model: PaymentModel
          enrollment_limit: number | null
          validity_days: number
          created_by: string
          is_published: boolean
          views_count: number
          enrollments_count: number
          language: string
          age_groups: string[] | null
          student_types: string[] | null
          highlights: Json | null
          outcomes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          subtitle?: string | null
          category: CourseCategory
          grade_level?: string | null
          subject?: string | null
          thumbnail_url?: string | null
          intro_video_url?: string | null
          learning_objectives?: string[] | null
          duration_minutes?: number
          difficulty?: string | null
          price?: number
          payment_model?: PaymentModel
          enrollment_limit?: number | null
          validity_days?: number
          created_by: string
          is_published?: boolean
          views_count?: number
          enrollments_count?: number
          language?: string
          age_groups?: string[] | null
          student_types?: string[] | null
          highlights?: Json | null
          outcomes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          subtitle?: string | null
          category?: CourseCategory
          grade_level?: string | null
          subject?: string | null
          thumbnail_url?: string | null
          intro_video_url?: string | null
          learning_objectives?: string[] | null
          duration_minutes?: number
          difficulty?: string | null
          price?: number
          payment_model?: PaymentModel
          enrollment_limit?: number | null
          validity_days?: number
          created_by?: string
          is_published?: boolean
          views_count?: number
          enrollments_count?: number
          language?: string
          age_groups?: string[] | null
          student_types?: string[] | null
          highlights?: Json | null
          outcomes?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      course_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          color: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          color?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon_url?: string | null
          color?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          course_id: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          order_index?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          title: string
          description: string | null
          lesson_type: LessonType
          content_url: string | null
          embed_url: string | null
          embed_platform: string | null
          duration_minutes: number
          is_free_preview: boolean
          allow_download: boolean
          is_required: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title: string
          description?: string | null
          lesson_type: LessonType
          content_url?: string | null
          embed_url?: string | null
          embed_platform?: string | null
          duration_minutes?: number
          is_free_preview?: boolean
          allow_download?: boolean
          is_required?: boolean
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title?: string
          description?: string | null
          lesson_type?: LessonType
          content_url?: string | null
          embed_url?: string | null
          embed_platform?: string | null
          duration_minutes?: number
          is_free_preview?: boolean
          allow_download?: boolean
          is_required?: boolean
          order_index?: number
          created_at?: string
        }
      }
      enrollments: {
        Row: {
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
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrollment_date?: string
          completion_percentage?: number
          status?: EnrollmentStatus
          certificate_url?: string | null
          payment_id?: string | null
          last_accessed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrollment_date?: string
          completion_percentage?: number
          status?: EnrollmentStatus
          certificate_url?: string | null
          payment_id?: string | null
          last_accessed_at?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          amount: number
          currency: string
          payment_gateway: string
          transaction_id: string | null
          coupon_id: string | null
          discount_amount: number
          final_amount: number
          status: PaymentStatus
          payment_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          amount: number
          currency?: string
          payment_gateway: string
          transaction_id?: string | null
          coupon_id?: string | null
          discount_amount?: number
          final_amount: number
          status?: PaymentStatus
          payment_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          amount?: number
          currency?: string
          payment_gateway?: string
          transaction_id?: string | null
          coupon_id?: string | null
          discount_amount?: number
          final_amount?: number
          status?: PaymentStatus
          payment_date?: string | null
          created_at?: string
        }
      }
      progress_tracking: {
        Row: {
          id: string
          student_id: string
          lesson_id: string
          status: ProgressStatus
          last_position_seconds: number
          watch_percentage: number
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          lesson_id: string
          status?: ProgressStatus
          last_position_seconds?: number
          watch_percentage?: number
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          lesson_id?: string
          status?: ProgressStatus
          last_position_seconds?: number
          watch_percentage?: number
          completed_at?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_course_progress: {
        Args: {
          p_student_id: string
          p_course_id: string
        }
        Returns: number
      }
      get_student_dashboard_stats: {
        Args: {
          p_student_id: string
        }
        Returns: {
          total_courses: number
          active_courses: number
          completed_courses: number
          total_certificates: number
          avg_progress: number
        }[]
      }
      is_coupon_valid: {
        Args: {
          p_coupon_code: string
          p_course_id: string
          p_purchase_amount: number
        }
        Returns: {
          is_valid: boolean
          discount_amount: number
          error_message: string
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      student_type: StudentType
      course_category: CourseCategory
      payment_model: PaymentModel
      lesson_type: LessonType
      platform_type: PlatformType
      question_type: QuestionType
      submission_type: SubmissionType
      discount_type: DiscountType
      payment_status: PaymentStatus
      enrollment_status: EnrollmentStatus
      class_status: ClassStatus
      progress_status: ProgressStatus
      notification_type: NotificationType
      priority_level: PriorityLevel
      ticket_status: TicketStatus
      submission_status: SubmissionStatus
      target_audience: TargetAudience
    }
  }
}