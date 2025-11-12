// Knowledge base for the chatbot system
export const knowledgeBase = {
  // Course-related FAQs
  courses: {
    enrollment: `To enroll in a course:
1. Browse available courses from the Courses page
2. Click on a course to view details
3. Click "Enroll Now" button
4. Complete the payment process
5. Access your course from the Student Dashboard`,
    
    access: `After enrollment, access your courses from:
- Student Dashboard > My Courses
- Click on any course to view lessons, assignments, and materials
- Track your progress in the Progress tab`,
    
    certificates: `Certificates are awarded when you:
- Complete all course lessons
- Submit all required assignments
- Pass all quizzes with minimum 70% score
- Meet course completion requirements
View certificates in Student Dashboard > Certificates`,
  },

  // Payment-related FAQs
  payments: {
    methods: `We accept the following payment methods:
- Credit/Debit Cards (Visa, Mastercard, Amex)
- PayPal
- Razorpay (UPI, Net Banking, Wallets)
- Bank Transfer (for institutional purchases)`,
    
    refunds: `Refund Policy:
- Full refund within 7 days of purchase
- 50% refund within 14 days
- No refunds after 14 days or 25% course completion
- Contact support@stharoon.edu for refund requests`,
    
    failed: `If your payment failed:
1. Check your payment method details
2. Ensure sufficient funds
3. Try a different payment method
4. Contact your bank if issue persists
5. Reach out to our support team for assistance`,
  },

  // Technical support FAQs
  technical: {
    login: `Login Issues:
- Verify your email and password
- Use "Forgot Password" to reset
- Clear browser cache and cookies
- Try a different browser
- Contact support if problem persists`,
    
    video: `Video playback issues:
- Check your internet connection
- Try a different browser
- Disable browser extensions
- Update your browser to latest version
- Reduce video quality in player settings`,
    
    browser: `Supported Browsers:
- Chrome (recommended) - latest version
- Firefox - latest version
- Safari - latest version
- Edge - latest version
For best experience, keep your browser updated`,
  },

  // Assignment and quiz FAQs
  assignments: {
    submission: `To submit an assignment:
1. Go to Student Dashboard > Assignments
2. Click on the assignment
3. Upload your files or enter text
4. Review your submission
5. Click "Submit Assignment"
6. You'll receive a confirmation email`,
    
    late: `Late Submission Policy:
- 10% penalty for 1-2 days late
- 25% penalty for 3-5 days late
- 50% penalty for 6-7 days late
- Not accepted after 7 days
Contact your instructor for extensions`,
    
    grading: `Assignment Grading:
- Assignments are graded within 5-7 business days
- You'll receive email notification when graded
- View grades in Student Dashboard > Grades
- Instructors may provide feedback and comments`,
  },

  // Live classes FAQs
  liveClasses: {
    joining: `To join a live class:
1. Check schedule in Student Dashboard > Live Classes
2. Click "Join Class" 5 minutes before start time
3. Allow camera and microphone permissions
4. Test your audio/video before class
5. Use chat for questions during class`,
    
    recording: `Class Recordings:
- All live classes are recorded
- Recordings available within 24 hours
- Access from Live Classes > Past Classes
- Available for 90 days after class date
- Download option available for enrolled students`,
  },

  // Account and profile FAQs
  account: {
    profile: `Update Your Profile:
1. Go to Dashboard > Profile
2. Click "Edit Profile"
3. Update your information
4. Upload profile photo (optional)
5. Click "Save Changes"`,
    
    password: `Change Password:
1. Go to Dashboard > Settings
2. Click "Change Password"
3. Enter current password
4. Enter new password (min 8 characters)
5. Confirm new password
6. Click "Update Password"`,
    
    verification: `ID Verification:
- Required for certificate issuance
- Upload government-issued ID
- Processing takes 1-2 business days
- You'll receive email notification
- Contact support for verification issues`,
  },

  // Contact information
  contact: {
    support: `Contact Support:
- Email: support@stharoon.edu
- Phone: +1-234-567-8900 (24/7)
- Live Chat: Available on website
- Support Hours: 24/7 for urgent issues
- Response time: Within 24 hours`,
    
    emergency: `For Urgent Issues:
- Call: +1-234-567-8900
- Mark ticket as "Urgent"
- Use live chat for immediate help
- Email: urgent@stharoon.edu
We prioritize urgent technical and payment issues`,
  }
};

// Intent patterns for classification
export const intentPatterns = {
  enrollment: ['enroll', 'register', 'sign up', 'join course', 'how to enroll'],
  payment: ['payment', 'pay', 'refund', 'billing', 'charge', 'cost', 'price'],
  technical: ['login', 'password', 'error', 'not working', 'broken', 'bug', 'issue'],
  assignment: ['assignment', 'homework', 'submit', 'deadline', 'late submission'],
  quiz: ['quiz', 'test', 'exam', 'assessment', 'grade'],
  certificate: ['certificate', 'certification', 'diploma', 'credential'],
  liveClass: ['live class', 'webinar', 'zoom', 'meeting', 'recording'],
  profile: ['profile', 'account', 'personal info', 'update details'],
  contact: ['contact', 'support', 'help', 'phone', 'email']
};

// Get relevant knowledge based on intent
export function getKnowledgeByIntent(intent: string): string {
  const intentMap: Record<string, string> = {
    enrollment: knowledgeBase.courses.enrollment,
    payment: knowledgeBase.payments.methods,
    technical: knowledgeBase.technical.login,
    assignment: knowledgeBase.assignments.submission,
    quiz: knowledgeBase.assignments.grading,
    certificate: knowledgeBase.courses.certificates,
    liveClass: knowledgeBase.liveClasses.joining,
    profile: knowledgeBase.account.profile,
    contact: knowledgeBase.contact.support
  };

  return intentMap[intent] || '';
}

// Classify user intent from message
export function classifyIntent(message: string): { intent: string; confidence: number } {
  const lowerMessage = message.toLowerCase();
  let bestMatch = { intent: 'general', confidence: 0 };

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        const confidence = pattern.length / lowerMessage.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence: Math.min(confidence * 100, 95) };
        }
      }
    }
  }

  return bestMatch;
}
