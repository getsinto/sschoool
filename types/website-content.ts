// Website Content Management Types
// Date: 2025-01-10

export interface Brochure {
  id: string
  title: string
  description?: string
  file_url: string
  file_size?: number
  total_pages?: number
  version?: string
  brochure_type: 'online_school' | 'spoken_english' | 'tuition' | 'general'
  is_current: boolean
  allow_download: boolean
  require_email: boolean
  download_count: number
  is_active: boolean
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface BrochureDownload {
  id: string
  brochure_id: string
  user_email?: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  downloaded_at: string
}

export interface Testimonial {
  id: string
  person_name: string
  person_type: 'parent' | 'student'
  person_photo_url?: string
  rating?: number
  testimonial_text: string
  student_name?: string
  student_grade?: string
  course_program?: string
  video_url?: string
  is_featured: boolean
  display_order: number
  status: 'active' | 'inactive'
  views_count: number
  created_at: string
  updated_at: string
  approved_by?: string
}

export interface PlatformFeature {
  id: string
  icon_name?: string
  icon_url?: string
  icon_color: string
  title: string
  description: string
  details?: string
  feature_image_url?: string
  category: 'teaching' | 'learning' | 'platform' | 'student_benefits' | 'parent_benefits'
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WebsiteContent {
  id: string
  content_key: string
  content_value?: string
  content_type: 'text' | 'html' | 'image' | 'video' | 'json' | 'url'
  section?: string
  metadata?: Record<string, any>
  last_updated_by?: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'admissions' | 'courses' | 'payments' | 'technical' | 'general'
  display_order: number
  views_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HomepageSection {
  id: string
  section_name: string
  section_title?: string
  is_enabled: boolean
  display_order: number
  settings?: Record<string, any>
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  photo_url?: string
  bio?: string
  email?: string
  social_links?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Form data types
export interface BrochureFormData {
  title: string
  description?: string
  file_url: string
  file_size?: number
  total_pages?: number
  version?: string
  brochure_type: 'online_school' | 'spoken_english' | 'tuition' | 'general'
  is_current?: boolean
  allow_download?: boolean
  require_email?: boolean
}

export interface TestimonialFormData {
  person_name: string
  person_type: 'parent' | 'student'
  person_photo_url?: string
  rating?: number
  testimonial_text: string
  student_name?: string
  student_grade?: string
  course_program?: string
  video_url?: string
  is_featured?: boolean
  display_order?: number
}

export interface FeatureFormData {
  icon_name?: string
  icon_url?: string
  icon_color?: string
  title: string
  description: string
  details?: string
  feature_image_url?: string
  category: 'teaching' | 'learning' | 'platform' | 'student_benefits' | 'parent_benefits'
  display_order?: number
}

export interface FAQFormData {
  question: string
  answer: string
  category: 'admissions' | 'courses' | 'payments' | 'technical' | 'general'
  display_order?: number
}

export interface TeamMemberFormData {
  name: string
  role: string
  photo_url?: string
  bio?: string
  email?: string
  social_links?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  display_order?: number
}

// API response types
export interface BrochuresResponse {
  brochures: Brochure[]
  total: number
}

export interface TestimonialsResponse {
  testimonials: Testimonial[]
  total: number
}

export interface FeaturesResponse {
  features: PlatformFeature[]
  total: number
}

export interface FAQsResponse {
  faqs: FAQ[]
  total: number
}

export interface WebsiteContentResponse {
  content: WebsiteContent[]
}

export interface HomepageSectionsResponse {
  sections: HomepageSection[]
}

export interface TeamMembersResponse {
  members: TeamMember[]
  total: number
}

// Analytics types
export interface BrochureAnalytics {
  brochure_id: string
  title: string
  total_downloads: number
  downloads_by_type: {
    authenticated: number
    anonymous: number
  }
  downloads_by_date: {
    date: string
    count: number
  }[]
}
