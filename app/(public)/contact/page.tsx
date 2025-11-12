'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SharedLayout from '@/components/layout/SharedLayout'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

const SUBJECTS = [
  'General Inquiry',
  'Course Information',
  'Technical Support',
  'Billing & Payments',
  'Teacher Application',
  'Partnership Opportunities',
  'Media & Press',
  'Other',
]

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: ['info@stharoonschool.com', 'support@stharoonschool.com'],
    description: 'Send us an email anytime',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    description: 'Speak with our team',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['123 Education Street', 'Learning City, LC 12345'],
    description: 'Our main office location',
  },
  {
    icon: Clock,
    title: 'Office Hours',
    details: ['Mon-Fri: 8:00 AM - 8:00 PM', 'Sat-Sun: 10:00 AM - 6:00 PM'],
    description: 'When we\'re available',
  },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SharedLayout>
      <div className="bg-white">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses or need support? We're here to help! 
              Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                    <div className="space-y-1 mb-2">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm">{info.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          {...register('phone')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Select onValueChange={(value) => setValue('subject', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.subject && (
                          <p className="text-sm text-red-600">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        placeholder="Tell us how we can help you..."
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Embedded Map */}
              <Card className="p-0 overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center text-gray-700">
                      <MapPin className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-semibold">Interactive Map</p>
                      <p className="text-sm">123 Education Street, Learning City</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Office Hours */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-600" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday - Sunday</span>
                    <span className="font-medium">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holidays</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      * All times are in Eastern Standard Time (EST)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Follow Us</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Stay connected with us on social media for updates and educational content.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <a
                          key={index}
                          href={social.href}
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          aria-label={social.label}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Support */}
              <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center text-green-800">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Need Immediate Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-green-700 text-sm mb-4">
                    For urgent technical issues or immediate support, use our live chat feature 
                    or call our support hotline.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Start Live Chat
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600">
                      Call Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-gray-600">
              Check out our FAQ section for quick answers to common questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Admissions', count: '12 questions', href: '/faq#admissions' },
              { title: 'Courses', count: '18 questions', href: '/faq#courses' },
              { title: 'Payments', count: '8 questions', href: '/faq#payments' },
              { title: 'Technical', count: '15 questions', href: '/faq#technical' },
            ].map((category, index) => (
              <a
                key={index}
                href={category.href}
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.count}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">We're Here to Help</h2>
            <p className="text-gray-400 mb-8">
              Our dedicated support team is ready to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Live Chat
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Browse FAQ
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </SharedLayout>
  )
}