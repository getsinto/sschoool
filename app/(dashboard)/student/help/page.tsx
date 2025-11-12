'use client'

import { useState } from 'react'
import {
  Search,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I enroll in a course?',
        a: 'Navigate to the "My Courses" page and click "Browse Courses". Select a course you\'re interested in and click "Enroll Now". Some courses may require payment or approval.'
      },
      {
        q: 'How do I access my enrolled courses?',
        a: 'Go to "My Courses" from the sidebar. You\'ll see all your enrolled courses with their progress. Click on any course to access lessons, assignments, and materials.'
      },
      {
        q: 'Can I download course materials?',
        a: 'Yes! Most course materials including PDFs, documents, and resources can be downloaded. Look for the download icon next to each resource.'
      }
    ]
  },
  {
    category: 'Learning',
    questions: [
      {
        q: 'How do I submit assignments?',
        a: 'Open the assignment from your course page. You can upload files or type your response directly. Make sure to click "Submit" before the deadline. You can save drafts before submitting.'
      },
      {
        q: 'Can I retake quizzes?',
        a: 'It depends on the course settings. Most quizzes allow 2-3 attempts. Check the quiz instructions for specific retry policies and deadlines.'
      },
      {
        q: 'How do I track my progress?',
        a: 'Visit the "Progress" page to see detailed analytics including completed lessons, grades, study time, and achievements. Each course also shows individual progress.'
      }
    ]
  },
  {
    category: 'Certificates',
    questions: [
      {
        q: 'How do I earn a certificate?',
        a: 'Complete all required lessons, assignments, and quizzes in a course with a passing grade (usually 70% or higher). Certificates are automatically generated upon completion.'
      },
      {
        q: 'How can I download my certificate?',
        a: 'Go to the "Certificates" page and click "Download" on any earned certificate. You can download it as a PDF or share it on social media.'
      },
      {
        q: 'Are certificates verified?',
        a: 'Yes! Each certificate has a unique verification number. Anyone can verify your certificate authenticity using the verification link provided.'
      }
    ]
  },
  {
    category: 'Technical Issues',
    questions: [
      {
        q: 'Video won\'t play. What should I do?',
        a: 'Try refreshing the page, clearing your browser cache, or using a different browser. Ensure you have a stable internet connection. If issues persist, contact support.'
      },
      {
        q: 'I can\'t submit my assignment. Help!',
        a: 'Check your file size (max 10MB per file) and format (PDF, DOC, DOCX, JPG, PNG). If you\'re still having issues, try a different browser or contact your instructor.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page. Enter your email and follow the instructions sent to your inbox. If you don\'t receive an email, check your spam folder.'
      }
    ]
  }
]

const quickLinks = [
  { icon: BookOpen, title: 'Course Catalog', description: 'Browse available courses', href: '/courses' },
  { icon: Video, title: 'Video Tutorials', description: 'Learn how to use the platform', href: '#' },
  { icon: FileText, title: 'Documentation', description: 'Detailed guides and manuals', href: '#' },
  { icon: MessageSquare, title: 'Community Forum', description: 'Connect with other students', href: '#' }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
        <p className="text-gray-600 mb-6">
          Search our knowledge base or browse categories below
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-6">
              {filteredFaqs.map((category, catIndex) => (
                <div key={catIndex}>
                  <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, qIndex) => (
                      <AccordionItem key={qIndex} value={`${catIndex}-${qIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="text-left">{faq.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No results found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or contact support</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email Support</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Get help via email within 24 hours
                </p>
                <a href="mailto:support@example.com" className="text-sm text-blue-600 hover:underline">
                  support@example.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Live Chat</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Chat with our support team
                </p>
                <Button variant="link" className="p-0 h-auto text-sm">
                  Start Chat
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Support Hours</h4>
                <p className="text-sm text-gray-600">
                  Monday - Friday<br />
                  9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
