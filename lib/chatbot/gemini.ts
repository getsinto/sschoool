import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, ChatMessage } from '@/types/chatbot';
import { fallbackChatbot } from './fallback';

// Check if API key is available
const hasApiKey = !!process.env.GEMINI_API_KEY;

// Initialize Gemini API only if key is available
const genAI = hasApiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!) : null;

// Rate limiting
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

export class GeminiChatbot {
  private model: any;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    if (genAI) {
      // Use gemini-1.5-flash for better availability and performance
      // gemini-pro is deprecated, use gemini-1.5-pro or gemini-1.5-flash
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  // Check rate limit
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = rateLimiter.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT) {
      return false;
    }
    
    recentRequests.push(now);
    rateLimiter.set(userId, recentRequests);
    return true;
  }

  // Build system prompt with context
  private buildSystemPrompt(context: UserContext): string {
    const { userName, userRole, currentPage, enrolledCourses } = context;

    return `You are a helpful assistant for St Haroon English Medium Online School.

Your role is to assist users with:
- Course information and enrollment
- Platform navigation
- Schedule and class information
- General inquiries
- Technical support

User context:
- Role: ${userRole || 'guest'}
- Name: ${userName || 'Guest'}
- Current page: ${currentPage || 'unknown'}
- Enrolled courses: ${enrolledCourses?.length || 0} courses

Guidelines:
- Be friendly, professional, and concise
- Provide accurate information
- If unsure, offer to connect with support
- Use simple language
- Be helpful but brief
- Never make up information
- Always prioritize user safety and privacy`;
  }

  // Send message to Gemini
  async sendMessage(
    userMessage: string,
    context: UserContext
  ): Promise<ChatMessage> {
    // Use fallback if no API key
    if (!hasApiKey || !genAI) {
      console.log('Using fallback chatbot (no Gemini API key)');
      return fallbackChatbot.sendMessage(userMessage, context);
    }

    try {
      // Check rate limit
      const userId = context.userId || 'anonymous';
      if (!this.checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }

      // Build conversation history
      const systemPrompt = this.buildSystemPrompt(context);
      const conversationContext = this.conversationHistory
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Prepare prompt
      const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationContext}

User: ${userMessage}
Assistant:`;

      // Generate response
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Create response message
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        content: text,
        role: 'assistant',
        timestamp: new Date(),
        intent: 'general',
        confidence: 0.9,
        suggestions: this.generateSuggestions(userMessage, text)
      };

      // Add to conversation history
      this.conversationHistory.push(
        {
          id: (Date.now() - 1).toString(),
          content: userMessage,
          role: 'user',
          timestamp: new Date()
        },
        responseMessage
      );

      // Keep history manageable
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return responseMessage;

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback to local chatbot on error
      return fallbackChatbot.sendMessage(userMessage, context);
    }
  }

  // Generate contextual suggestions
  private generateSuggestions(userMessage: string, response: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('course') || lowerMessage.includes('class')) {
      return ['Browse Courses', 'Enrollment Info', 'View Schedule'];
    }
    
    if (lowerMessage.includes('enroll') || lowerMessage.includes('register')) {
      return ['Start Enrollment', 'View Pricing', 'Course Requirements'];
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return ['View Pricing', 'Payment Options', 'Available Discounts'];
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return ['Create Support Ticket', 'View FAQs', 'Contact Us'];
    }
    
    // Default suggestions
    return ['Browse Courses', 'Contact Support', 'View FAQs'];
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// Export singleton instance
export const geminiChatbot = new GeminiChatbot();

// Export function for compatibility with existing code
export async function generateChatResponse(
  message: string,
  history: any[],
  context: any,
  userId?: string
): Promise<any> {
  const userContext: UserContext = {
    userId: userId || 'anonymous',
    userName: context?.userName,
    userRole: context?.userRole,
    currentPage: context?.currentPage,
    enrolledCourses: context?.enrolledCourses
  };

  const response = await geminiChatbot.sendMessage(message, userContext);
  
  return {
    message: response.content,
    intent: response.intent || 'general',
    confidence: response.confidence || 0.8,
    suggestedActions: response.suggestions || [],
    requiresEscalation: false
  };
}
