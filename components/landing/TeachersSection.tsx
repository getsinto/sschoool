'use client'

import { Button } from '@/components/ui/button'
import { GraduationCap, Award, Globe, BookOpen, Users, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function TeachersSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
            Our Educators
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Learn from the{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Best Educators
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Our world-class teachers are passionate about education and dedicated to your success. 
            Every educator is carefully selected and trained to deliver exceptional learning experiences.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Teacher Qualities */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">What Makes Our Teachers Special</h3>
            
            {[
              {
                icon: <GraduationCap className="w-6 h-6" />,
                title: 'Highly Qualified',
                description: 'Advanced degrees from top universities and specialized certifications in their fields'
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: 'Proven Experience',
                description: 'Years of teaching experience with track record of student success and achievement'
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: 'Innovative Methods',
                description: 'Using modern teaching techniques and technology to make learning engaging and effective'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Global Perspective',
                description: 'Multilingual educators bringing diverse cultural insights to the classroom'
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Student-Centered',
                description: 'Personalized attention and adaptive teaching styles for every learning need'
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: 'Continuous Growth',
                description: 'Regular professional development and training in latest educational practices'
              }
            ].map((quality, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-gray-900">
                  {quality.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{quality.title}</h4>
                  <p className="text-blue-200 text-sm">{quality.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Stats and CTA */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-8">By the Numbers</h3>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '150+', label: 'Expert Teachers', sublabel: 'Across all subjects' },
                { value: '100%', label: 'Certified', sublabel: 'Verified credentials' },
                { value: '15+', label: 'Avg Experience', sublabel: 'Years of teaching' },
                { value: '4.9/5', label: 'Rating', sublabel: 'Student satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                  <div className="text-white font-semibold mb-1">{stat.label}</div>
                  <div className="text-blue-200 text-sm">{stat.sublabel}</div>
                </div>
              ))}
            </div>

            {/* Teacher Specializations */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-6">Subject Expertise</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Mathematics',
                  'Science',
                  'English',
                  'Languages',
                  'Social Studies',
                  'Computer Science',
                  'Arts & Music',
                  'Test Prep'
                ].map((subject, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-blue-100">{subject}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center pt-4">
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Users className="w-6 h-6 mr-2" />
                  Start Learning Today
                </Button>
              </Link>
              <p className="text-blue-200 text-sm mt-4">Join 2,500+ students learning from the best</p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-8 text-center shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Meet Your Perfect Teacher?
            </h3>
            <p className="text-gray-800 text-lg mb-6">
              Every student is matched with teachers who understand their learning style and goals
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-semibold">
                ✓ Personalized Matching
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-semibold">
                ✓ Free Trial Class
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-semibold">
                ✓ Flexible Schedule
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
