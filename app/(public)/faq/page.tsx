'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import SharedLayout from '@/components/layout/SharedLayout'
import { Search, MessageCircle, Phone, Mail } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('admissions')

  // Filter FAQs based on search term
  const filteredFAQs = Object.entries(faqData).reduce((acc, [category, faqs]) => {
    const filtered = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, typeof faqData.admissions>)

  const totalFAQs = Object.values(faqData).flat().length
  const filteredCount = Object.values(filteredFAQs).flat().length

  return (
    <SharedLayout>
      <div className="bg-white">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to common questions about our online school, courses, and services. 
              Can't find what you're looking for? Contact our support team.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-full"
              />
            </div>
            
            {searchTerm && (
              <p className="mt-4 text-gray-600">
                Showing {filteredCount} of {totalFAQs} questions
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm ? (
            // Search Results
            <div className="space-y-8">
              {Object.entries(filteredFAQs).map(([category, faqs]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                    {category} ({faqs.length})
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={`${category}-${index}`}
                        value={`${category}-${index}`}
                        className="border border-gray-200 rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-6">
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
              
              {filteredCount === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try different keywords or browse categories below.
                  </p>
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Category Tabs
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4 mb-12 bg-white shadow-lg rounded-xl p-2">
                <TabsTrigger 
                  value="admissions" 
                  className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Admissions
                </TabsTrigger>
                <TabsTrigger 
                  value="courses"
                  className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Courses
                </TabsTrigger>
                <TabsTrigger 
                  value="payments"
                  className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Payments
                </TabsTrigger>
                <TabsTrigger 
                  value="technical"
                  className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Technical
                </TabsTrigger>
              </TabsList>

              {Object.entries(faqData).map(([category, faqs]) => (
                <TabsContent key={category} value={category}>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                      {category} Questions
                    </h2>
                    <p className="text-gray-600">
                      {faqs.length} frequently asked questions about {category.toLowerCase()}
                    </p>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-gray-200 rounded-lg px-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-6">
                          <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find the answer you're looking for? Our support team is here to help you 24/7.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-4">Speak directly with our support team</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Call Now
                </Button>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-300"
              onClick={() => window.location.href = '/auth/register'}
            >
              Start Learning Today
            </Button>
          </div>
        </div>
      </section>
      </div>
    </SharedLayout>
  )
}