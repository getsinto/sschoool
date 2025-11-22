// Google Gemini AI Integration for Chatbot

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
      this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
- Always prioritize user safety and privacy

Available actions you can suggest:
- search_courses: Help find courses
- fetch_schedule: Show user's schedule
- get_progress: Display progress information
- create_ticket: Create support ticket
- show_faq: Show relevant FAQs

When suggesting actions, format them as: [ACTION:action_type:data]
Example: [ACTION:search_courses:mathematics]

Remember: You're representing an educational institution. Be professional and helpful.`;
  }

  // Parse actions from response
  private parseActions(content: string): any[] {
    const actionRegex = /\[ACTION:(\w+):([^\]]+)\]/g;
    const actions = [];
    let match;

    while ((match = actionRegex.exec(content)) !== null) {
      actions.push({
        type: match[1],
        data: match[2],
      });
    }

    return actions;
  }

  // Detect intent from message
  private detectIntent(message: string): { intent: string; confidence: number } {
    const lowerMessage = message.toLowerCase();

    // Define intent patterns
    const intents = [
      { name: 'course_inquiry', keywords: ['course', 'class', 'learn', 'study', 'enroll'], weight: 1 },
      { name: 'schedule', keywords: ['schedule', 'time', 'when', 'calendar'], weight: 1 },
      { name: 'technical_support', keywords: ['error', 'problem', 'issue', 'bug', 'not working'], weight: 1.2 },
      { name: 'billing', keywords: ['payment', 'price', 'cost', 'fee', 'refund'], weight: 1 },
      { name: 'progress', keywords: ['progress', 'grade', 'score', 'performance'], weight: 1 },
      { name: 'general', keywords: ['help', 'how', 'what', 'where'], weight: 0.5 },
    ];

    let bestIntent = 'general';
    let bestScore = 0;

    for (const intent of intents) {
      let score = 0;
      for (const keyword of intent.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += intent.weight;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent.name;
      }
    }

    const confidence = Math.min(bestScore / 3, 1); // Normalize to 0-1

    return { intent: bestIntent, confidence };
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

Assistant: ${userMessage}`;

      // Call Gemini API
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      // Detect intent and confidence
      const { intent, confidence } = this.detectIntent(userMessage);

      // Parse actions from response
      const actions = this.parseActions(responseText);

      // Clean response text (remove action markers)
      const cleanedText = responseText.replace(/\[ACTION:\w+:[^\]]+\]/g, '').trim();

      // Generate suggestions based on intent
      const suggestions = this.generateSuggestions(intent);

      // Create chat message
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: cleanedText,
        timestamp: new Date(),
        suggestions: suggestions || [],
        actions: actions || [],
        intent,
        confidence,
      };

      // Add to conversation history
      this.conversationHistory.push({
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });
      this.conversationHistory.push(chatMessage);

      // Keep only last 20 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return chatMessage;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Use fallback on error
      console.log('Falling back to simple chatbot due to error');
      return fallbackChatbot.sendMessage(userMessage, context);
    }
  }

  // Generate contextual suggestions
  private generateSuggestions(intent: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      course_inquiry: ['Browse Courses', 'Enrollment Process', 'Course Requirements'],
      schedule: ['View Schedule', 'Upcoming Classes', 'Class Calendar'],
      technical_support: ['Report Issue', 'Talk to Support', 'View FAQs'],
      billing: ['Payment Options', 'Pricing', 'Refund Policy'],
      progress: ['View Progress', 'Check Grades', 'Certificates'],
      general: ['Browse Courses', 'Contact Us', 'Help Center'],
    };

    return suggestionMap[intent] || suggestionMap.general;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
}

// Export singleton instance
export const geminiChatbot = new GeminiChatbot();

// Export helper function for chat response
export async function generateChatResponse(
  message: string,
  context: UserContext
): Promise<ChatMessage> {
  return geminiChatbot.sendMessage(message, context);
}
