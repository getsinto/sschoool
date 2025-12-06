import FAQContent from '@/components/public/FAQContent'
import SharedLayout from '@/components/layout/SharedLayout'

const faqData = {
  admissions: [
    {
      question: 'How do I enroll in courses?',
      answer: 'You can enroll by creating an account, browsing our course catalog, and clicking "Enroll Now" on any course. Payment can be made through multiple gateways including PayPal, Stripe, and Razorpay.',
    },
    {
      question: 'What are the admission requirements?',
      answer: 'Requirements vary by course level. Generally, you need a stable internet connection, basic computer skills, and grade-appropriate prerequisites. Specific requirements are listed on each course page.',
    },
    {
      question: 'Is there an age limit for enrollment?',
      answer: 'We accept students from age 5 to adult learners. For students under 13, parental consent is required as per COPPA regulations.',
    },
    {
      question: 'Can international students enroll?',
      answer: 'Yes! We welcome students from all countries. Our platform supports multiple time zones and currencies to accommodate international learners.',
    },
    {
      question: 'Do you offer scholarships or financial aid?',
      answer: 'Yes, we offer need-based scholarships and merit-based discounts. Contact our admissions team for more information about available financial assistance programs.',
    },
    {
      question: 'How long does the enrollment process take?',
      answer: 'The enrollment process is instant for most courses. After payment confirmation, you\'ll receive immediate access to course materials and can start learning right away.',
    },
  ],
  courses: [
    {
      question: 'What types of courses do you offer?',
      answer: 'We offer three main categories: Online School (K-12 curriculum), Spoken English (conversation and fluency), and Tuition (exam preparation and specialized subjects).',
    },
    {
      question: 'Are courses self-paced or scheduled?',
      answer: 'We offer both options. Most courses include live scheduled classes plus recorded sessions you can access anytime. This provides flexibility while maintaining structured learning.',
    },
    {
      question: 'Do I get a certificate upon completion?',
      answer: 'Yes, all students receive a verified digital certificate upon successful course completion. Certificates include your name, course details, and completion date.',
    },
    {
      question: 'Can I switch courses after enrollment?',
      answer: 'Course changes are possible within the first 7 days of enrollment. Contact our support team to discuss your options and any applicable fees.',
    },
    {
      question: 'What if I miss a live class?',
      answer: 'All live classes are recorded and available within 24 hours. You can catch up on missed content and still participate in assignments and discussions.',
    },
    {
      question: 'Are there prerequisites for advanced courses?',
      answer: 'Yes, some advanced courses require completion of prerequisite courses or demonstration of equivalent knowledge through placement tests.',
    },
    {
      question: 'How are assignments and exams conducted?',
      answer: 'Assignments are submitted through our platform, and exams are conducted online with proctoring when required. We use various assessment methods including quizzes, projects, and presentations.',
    },
  ],
  payments: [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, PayPal, Razorpay, and Stripe. We also offer installment plans for longer courses.',
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed through secure, encrypted gateways. We never store your payment information on our servers.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for most courses. Refund eligibility depends on course progress and completion percentage.',
    },
    {
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for courses over $200. You can split payments into 2-6 monthly installments depending on the course.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No, the price you see is the price you pay. There are no hidden fees, setup costs, or additional charges unless explicitly mentioned.',
    },
    {
      question: 'Can I pay in my local currency?',
      answer: 'We support multiple currencies including USD, EUR, GBP, INR, and more. Prices are automatically converted based on current exchange rates.',
    },
  ],
  technical: [
    {
      question: 'What are the technical requirements?',
      answer: 'You need a computer or tablet with internet connection, webcam, microphone, and a modern web browser. We also have mobile apps for iOS and Android.',
    },
    {
      question: 'Which browsers are supported?',
      answer: 'We support Chrome, Firefox, Safari, and Edge (latest versions). Chrome is recommended for the best experience.',
    },
    {
      question: 'Do you have a mobile app?',
      answer: 'Yes, our mobile apps are available on iOS App Store and Google Play Store. You can access courses, submit assignments, and join live classes from your mobile device.',
    },
    {
      question: 'What internet speed do I need?',
      answer: 'We recommend a minimum of 5 Mbps for video streaming and 10 Mbps for live classes. Higher speeds provide better video quality.',
    },
    {
      question: 'Can I download course materials?',
      answer: 'Yes, most course materials including PDFs, slides, and some videos can be downloaded for offline study. Availability varies by course.',
    },
    {
      question: 'How do I troubleshoot technical issues?',
      answer: 'Our technical support team is available 24/7 through live chat, email, or phone. We also have a comprehensive troubleshooting guide in our help center.',
    },
    {
      question: 'Is the platform accessible for students with disabilities?',
      answer: 'Yes, our platform follows WCAG 2.1 accessibility guidelines. We offer closed captions, screen reader support, and keyboard navigation.',
    },
  ],
}

export default function FAQPage() {
  return (
    <SharedLayout>
      <FAQContent />
    </SharedLayout>
  )
}