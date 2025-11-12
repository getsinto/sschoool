'use client'

import { 
  Video, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Headphones,
  BookOpen,
  Award,
  Globe,
  Shield,
  Zap,
  Heart
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description: 'Engage in real-time with teachers and classmates through our advanced virtual classroom technology.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Expert Certified Teachers',
    description: 'Learn from qualified educators with years of experience and proven track records.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Clock,
    title: 'Flexible Learning',
    description: 'Study at your own pace with recorded sessions and flexible scheduling options.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: DollarSign,
    title: 'Affordable Pricing',
    description: 'Quality education at competitive prices with flexible payment plans and scholarships.',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and personalized feedback.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Get help whenever you need it with our round-the-clock student support team.',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
]

const additionalFeatures = [
  {
    icon: BookOpen,
    title: 'Comprehensive Curriculum',
    description: 'Complete syllabus coverage aligned with international standards',
  },
  {
    icon: Award,
    title: 'Certificates & Recognition',
    description: 'Earn verified certificates upon course completion',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with students from around the world',
  },
  {
    icon: Shield,
    title: 'Safe Learning Environment',
    description: 'Secure platform with parental controls and monitoring',
  },
  {
    icon: Zap,
    title: 'Interactive Content',
    description: 'Engaging multimedia lessons and gamified learning',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Individual attention and customized learning paths',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Platform{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that make our online learning platform 
            the perfect choice for students worldwide.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">99%</div>
            <div className="text-gray-600">Student Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600">Learning Support</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">100K+</div>
            <div className="text-gray-600">Hours Taught</div>
          </div>
        </div>
      </div>
    </section>
  )
}