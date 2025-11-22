// Fallback chatbot responses when Gemini API is unavailable
import { ChatMessage, UserContext } from '@/types/chatbot';

interface FAQItem {
  keywords: string[];
  response: string;
  suggestions: string[];
}

const faqs: FAQItem[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! Welcome to St Haroon English Medium Online School. I'm here to help you with information about our courses, enrollment, schedules, and more. How can I assist you today?",
    suggestions: ['Browse Courses', 'Enrollment Process', 'Pricing', 'Contact Us']
  },
  {
    keywords: ['course', 'class', 'learn', 'study', 'subject'],
    response: "We offer a wide range of courses including Mathematics, Science, English, Social Studies, and more. Our courses are designed for students from primary to secondary levels. Would you like to browse our course catalog or learn about a specific subject?",
    suggestions: ['View All Courses', 'Course Requirements', 'Enrollment Info']
  },
  {
    keywords: ['enroll', 'register', 'signup', 'join', 'admission'],
    response: "Enrolling is easy! Simply browse our courses, select the ones you're interested in, and complete the enrollment process. You'll need to create an account if you haven't already. Would you like help with the enrollment process?",
    suggestions: ['Create Account', 'Browse Courses', 'Enrollment Guide']
  },
  {
    keywords: ['price', 'cost', 'fee', 'payment', 'billing'],
    response: "Our course pricing varies depending on the subject and level. We offer flexible payment options and occasional discounts. For detailed pricing information, please visit our pricing page or contact our support team.",
    suggestions: ['View Pricing', 'Payment Options', 'Contact Support']
  },
  {
    keywords: ['schedule', 'time', 'when', 'calendar', 'timing'],
    response: "Class schedules vary by course. Once enrolled, you can view your personalized schedule in your dashboard. Live classes are recorded so you can watch them later if you miss one.",
    suggestions: ['View Schedule', 'Live Classes', 'My Dashboard']
  },
  {
    keywords: ['teacher', 'instructor', 'faculty'],
    response: "Our teachers are experienced, qualified educators dedicated to student success. Each course page includes information about the instructor. You can also message your teachers directly through the platform.",
    suggestions: ['Meet Our Teachers', 'Contact Teacher', 'Browse Courses']
  },
  {
    keywords: ['certificate', 'certification', 'diploma'],
    response: "Yes! Upon successful completion of a course, you'll receive a certificate of completion. These certificates can be downloaded and shared. Some courses also offer advanced certifications.",
    suggestions: ['View Certificates', 'Course Requirements', 'My Progress']
  },
  {
    keywords: ['help', 'support', 'problem', 'issue', 'error'],
    response: "I'm here to help! For technical issues or detailed questions, our support team is available. You can create a support ticket or browse our FAQ section for quick answers.",
    suggestions: ['Create Support Ticket', 'View FAQs', 'Contact Us']
  },
  {
    keywords: ['progress', 'grade', 'score', 'performance', 'result'],
    response: "You can track your progress, grades, and performance in your student dashboard. It shows completed assignments, quiz scores, and overall course progress.",
    suggestions: ['View Progress', 'Check Grades', 'My Dashboard']
  },
  {
    keywords: ['contact', 'email', 'phone', 'reach'],
    response: "You can reach us through multiple channels: create a support ticket in the platform, email us, or use this chat. Our support team typically responds within 24 hours.",
    suggestions: ['Create Ticket', 'View Contact Info', 'FAQs']
  }
];

export class FallbackChatbot {
  // Find best matching FAQ
  private findBestMatch(message: string): FAQItem | null {
    const lowerMessage = message.toLowerCase();
    let bestMatch: FAQItem | null = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        if (lowerMessage.includes(keyword)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  // Generate response
  async sendMessage(
    userMessage: string,
    context: UserContext
  ): Promise<ChatMessage> {
    const match = this.findBestMatch(userMessage);

    if (match) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: match.response,
        timestamp: new Date(),
        suggestions: match.suggestions,
        intent: 'faq',
        confidence: 0.8,
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Thank you for your message! I can help you with information about our courses, enrollment, schedules, pricing, and more. What would you like to know?",
      timestamp: new Date(),
      suggestions: ['Browse Courses', 'Enrollment Info', 'Pricing', 'Contact Support'],
      intent: 'general',
      confidence: 0.5,
    };
  }
}

export const fallbackChatbot = new FallbackChatbot();
