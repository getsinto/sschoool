'use client'

import { useState } from 'react'
import { 
  Globe, 
  Users, 
  Clock, 
  BookOpen, 
  Award, 
  MessageCircle, 
  Shield, 
  Zap,
  Heart,
  Target,
  Lightbulb,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    id: 'global',
    icon: <Globe className="w-8 h-8" />,
    title: 'Global Accessibility',
    description: 'Learn from anywhere in the world with our cutting-edge online platform designed for seamless global education.',
    color: 'from-blue-500 to-cyan-500',
    stats: '25+ Countries',
    benefits: ['24/7 Platform Access', 'Multi-timezone Support', 'Global Student Community', 'International Curriculum']
  },
  {
    id: 'teachers',
    icon: <Users className="w-8 h-8" />,
    title: 'Expert Teachers',
    description: 'Certified and experienced educators dedicated to your success with personalized attention and proven teaching methods.',
    color: 'from-green-500 to-emerald-500',
    stats: '50+ Certified Teachers',
    benefits: ['PhD & Masters Qualified', 'Average 10+ Years Experience', 'Continuous Training', 'Student-Focused Approach']
  },
  {
    id: 'flexible',
    icon: <Clock className="w-8 h-8" />,
    title: 'Flexible Learning',
    description: 'Choose class timings that perfectly fit your schedule with multiple time zones and weekend options available.',
    color: 'from-purple-500 to-pink-500',
    stats: '200+ Time Slots',
    benefits: ['Morning & Evening Classes', 'Weekend Availability', 'Makeup Sessions', 'Self-Paced Options']
  },
  {
    id: 'curriculum',
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Comprehensive Curriculum',
    description: 'Well-structured courses aligned with international educational standards and updated with latest industry trends.',
    color: 'from-orange-500 to-red-500',
    stats: '100+ Courses',
    benefits: ['International Standards', 'Regular Updates', 'Practical Focus', 'Skill-Based Learning']
  },
  {
    id: 'technology',
    icon: <Zap className="w-8 h-8" />,
    title: 'Advanced Technology',
    description: 'State-of-the-art learning management system with interactive whiteboards, breakout rooms, and engagement tools.',
    color: 'from-indigo-500 to-blue-500',
    stats: '99.9% Uptime',
    benefits: ['HD Video Quality', 'Interactive Whiteboards', 'Screen Sharing', 'Recording Available']
  },
  {
    id: 'support',
    icon: <MessageCircle className="w-8 h-8" />,
    title: '24/7 Support',
    description: 'Round-the-clock support for all your learning needs with dedicated student success managers.',
    color: 'from-teal-500 to-green-500',
    stats: '<2min Response',
    benefits: ['Live Chat Support', 'Email Assistance', 'Phone Support', 'Technical Help']
  }
]

export default function EnhancedWhyChooseSection() {
  const [activeFeature, setActiveFeature] = useState('global')
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              St Haroon Online School?
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            We're committed to providing the best online education experience with innovative teaching methods, 
            cutting-edge technology, and unwavering support for every student's success.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Left Side - Feature Cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group cursor-pointer transition-all duration-500 ${
                  activeFeature === feature.id 
                    ? 'transform scale-105' 
                    : hoveredFeature === feature.id 
                      ? 'transform scale-102' 
                      : ''
                }`}
                onClick={() => setActiveFeature(feature.id)}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-500 ${
                  activeFeature === feature.id 
                    ? 'border-white/40 bg-white/20' 
                    : 'border-white/20 hover:border-white/30'
                }`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 ${
                      activeFeature === feature.id ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {feature.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <span className="text-sm text-blue-200 font-medium">{feature.stats}</span>
                      </div>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <div className={`flex-shrink-0 transition-transform duration-300 ${
                      activeFeature === feature.id ? 'translate-x-1' : ''
                    }`}>
                      <ArrowRight className="w-5 h-5 text-blue-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Active Feature Details */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              {/* Feature Header */}
              <div className="flex items-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${activeFeatureData.color} rounded-2xl flex items-center justify-center text-white shadow-xl mr-6`}>
                  {activeFeatureData.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">{activeFeatureData.title}</h3>
                  <p className="text-blue-200 font-medium">{activeFeatureData.stats}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                {activeFeatureData.description}
              </p>

              {/* Benefits */}
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  Key Benefits
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeFeatureData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-blue-100 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center">
                <Link href="/auth/register">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg">
                    Enroll Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="grid md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-200">Happy Students</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-200 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                Average Rating
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}