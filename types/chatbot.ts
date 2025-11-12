// Chatbot and Support System Types

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'guest'

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'technical' | 'billing' | 'academic' | 'general' | 'enrollment'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: ChatAction[]
  intent?: string
  confidence?: number
}

export interface ChatAction {
  type: 'search_courses' | 'fetch_schedule' | 'get_progress' | 'create_ticket' | 'show_faq'
  data?: any
}

export interface ChatConversation {
  id: string
  userId?: string
  sessionId: string
  startedAt: Date
  endedAt?: Date
  messageCount: number
  escalated: boolean
  satisfactionRating?: number
  metadata?: Record<string, any>
}

export interface UserContext {
  userId?: string
  userName?: string
  userRole?: UserRole
  userEmail?: string
  currentPage?: string
  enrolledCourses?: string[]
  conversationHistory?: ChatMessage[]
}

export interface SupportTicket {
  id: string
  ticketNumber: string
  userId: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  subject: string
  description: string
  assignedTo?: string
  courseId?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: UserRole
  message: string
  isInternal: boolean
  attachments: TicketAttachment[]
  createdAt: Date
}

export interface TicketAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: Date
}

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  keywords: string[]
  variations: string[]
  relatedFaqs: string[]
  usageCount: number
  helpfulCount: number
  notHelpfulCount: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FAQCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  active: boolean
}

export interface ChatbotAnalytics {
  date: Date
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  escalationRate: number
  resolutionRate: number
  avgSatisfaction: number
  popularIntents: { intent: string; count: number }[]
  failedQueries: { query: string; count: number }[]
}

export interface TicketMetrics {
  totalOpen: number
  totalInProgress: number
  totalResolved: number
  totalClosed: number
  avgResponseTime: number
  avgResolutionTime: number
  satisfactionScore: number
}
