'use client'

import StaticLayout from '@/components/layout/StaticLayout'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react'

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
  return (
    <StaticLayout>
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
                <div key={index} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
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
                </div>
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
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    For immediate assistance, please email us at{' '}
                    <a href="mailto:info@stharoonschool.com" className="text-blue-600 hover:underline">
                      info@stharoonschool.com
                    </a>
                  </p>
                </div>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Embedded Map */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center text-gray-700">
                      <MapPin className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-semibold">Interactive Map</p>
                      <p className="text-sm">123 Education Street, Learning City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-600" />
                    Office Hours
                  </h3>
                </div>
                <div className="space-y-2">
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
                </div>
              </div>

              {/* Social Media */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Follow Us</h3>
                  <p className="text-gray-600 text-sm">
                    Stay connected with us on social media for updates and educational content.
                  </p>
                </div>
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
              </div>

              {/* Quick Support */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center text-green-800">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Need Immediate Help?
                  </h3>
                </div>
                <p className="text-green-700 text-sm mb-4">
                  For urgent technical issues or immediate support, contact us at{' '}
                  <a href="tel:+15551234567" className="font-semibold hover:underline">
                    +1 (555) 123-4567
                  </a>
                </p>
              </div>
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
              <a 
                href="mailto:info@stharoonschool.com"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-center"
              >
                Email Us
              </a>
              <Link 
                href="/faq"
                className="inline-block border border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold text-center"
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </StaticLayout>
  )
}