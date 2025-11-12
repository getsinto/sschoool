import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

export interface UserContext {
  userId?: string
  userName?: string
  userRole?: 'student' | 'teacher' | 'parent' | 'admin' | 'guest'
  currentPage?: string
  enrolledCourses?: string[]
  conversationHistory?: Message[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  actions?: ChatAction[]
  confidence: number
}

export interface ChatAction {
  type: 'search_courses' | 'fetch_schedule' | 'get_progress' | 'create_ticket' | 'show_faq'
  data?: any
}

class GeminiChatbot {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  private buildSystemPrompt(context: UserContext): string {
    return `You are a helpful assistant for St Haroon English Medium Online School.

Your role is to assist users with:
- Course information and enrollment
- Platform navigation and features
- Schedule and class information
- General inquiries and support
- Payment and billing questions
- Technical troubleshooting

User context:
- Role: ${context.userRole || 'guest'}
- Name: ${context.userName || 'User'}
- Current page: ${context.currentPage || 'unknown'}
- Enrolled courses: ${context.enrolledCourses?.join(', ') || 'none'}

Guidelines:
- Be friendly, professional, and helpful
- Provide accurate information based on the platform
- If unsure, offer to connect with human support
- Use simple, clear language
- Be concise but thorough
- Personalize responses using the user's name and context
- For sensitive issues (account, payments, grades), verify identity or escalate

Available actions you can suggest:
- Search for courses
- View user schedule
- Check progress/grades
- Create support ticket
- Browse FAQs

Response format:
- Provide helpful answer
- Suggest 2-3 quick reply options when appropriate
- If you need to perform an action, indicate it clearly

Remember: You represent St Haroon School. Be warm, supportive, and educational.`
  }

  async sendMessage(
    userMessage: string,
    context: UserContext
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      // Build conversation history
      const conversationHistory = context.conversationHistory || []
      const messages = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ]

      const chat = this.model.startChat({
        history: messages.slice(0, -1) as any,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      })

      const result = await chat.sendMessage(userMessage)
      const response = result.response
      const text = response.text()

      // Parse response for actions and suggestions
      const { message, suggestions, actions } = this.parseResponse(text, userMessage)

      return {
        message,
        suggestions,
        actions,
        confidence: 0.8 // Could implement confidence scoring
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        message: "I'm having trouble processing your request right now. Would you like to speak with a human support agent?",
        suggestions: ['Talk to Human', 'Try Again', 'View FAQs'],
        actions: [],
        confidence: 0
      }
    }
  }

  private parseResponse(text: string, userMessage: string): {
    message: string
    suggestions: string[]
    actions: ChatAction[]
  } {
    const suggestions: string[] = []
    const actions: ChatAction[] = []

    // Detect intent and suggest actions
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('course') || lowerMessage.includes('enroll')) {
      suggestions.push('Browse Courses', 'Enrollment Guide', 'Pricing')
      actions.push({ type: 'search_courses' })
    }
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('class') || lowerMessage.includes('when')) {
      suggestions.push('View Schedule', 'Upcoming Classes', 'Set Reminder')
      actions.push({ type: 'fetch_schedule' })
    }
    
    if (lowerMessage.includes('grade') || lowerMessage.includes('progress') || lowerMessage.includes('performance')) {
      suggestions.push('View Grades', 'Progress Report', 'Talk to Teacher')
      actions.push({ type: 'get_progress' })
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      suggestions.push('Create Ticket', 'View FAQs', 'Talk to Human')
      actions.push({ type: 'create_ticket' })
    }

    // Default suggestions if none detected
    if (suggestions.length === 0) {
      suggestions.push('Ask Another Question', 'Browse Courses', 'Contact Support')
    }

    return {
      message: text,
      suggestions: suggestions.slice(0, 3),
      actions
    }
  }

  async searchFAQ(query: string): Promise<any[]> {
    // This would search the FAQ database
    // For now, return empty array
    return []
  }

  async detectIntent(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('enroll') || lowerMessage.includes('register') || lowerMessage.includes('sign up')) {
      return 'enrollment'
    }
    if (lowerMessage.includes('course') || lowerMessage.includes('class')) {
      return 'course_info'
    }
    if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
      return 'schedule'
    }
    if (lowerMessage.includes('grade') || lowerMessage.includes('score') || lowerMessage.includes('progress')) {
      return 'grades'
    }
    if (lowerMessage.includes('pay') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'payment'
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return 'support'
    }
    
    return 'general'
  }

  shouldEscalate(message: string, confidence: number): boolean {
    const escalationKeywords = [
      'speak to human',
      'talk to person',
      'real person',
      'agent',
      'representative',
      'manager',
      'complaint',
      'urgent',
      'emergency'
    ]

    const lowerMessage = message.toLowerCase()
    const hasEscalationKeyword = escalationKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    )

    return hasEscalationKeyword || confidence < 0.5
  }
}

export const geminiChatbot = new GeminiChatbot()
export default geminiChatbot
