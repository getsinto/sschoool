'use client'

import { Button } from '@/components/ui/button'
import { GraduationCap, Award, Globe, BookOpen, Users, Star, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AchievementsAndTeachersSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
            Our Excellence
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            World-Class Education{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Delivered by Experts
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students learning from certified educators who are passionate about your success
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { 
              icon: <GraduationCap className="w-10 h-10" />, 
              value: '2,500+', 
              label: 'Active Students', 
              description: 'Learning daily',
              color: 'from-blue-600 to-cyan-500',
              bgColor: 'from-blue-50 to-cyan-50'
            },
            { 
              icon: <Users className="w-10 h-10" />, 
              value: '150+', 
              label: 'Expert Teachers', 
              description: '100% certified',
              color: 'from-green-600 to-emerald-500',
              bgColor: 'from-green-50 to-emerald-50'
            },
            { 
              icon: <Award className="w-10 h-10" />, 
              value: '98%', 
              label: 'Success Rate', 
              description: 'Achieving goals',
              color: 'from-purple-600 to-pink-500',
              bgColor: 'from-purple-50 to-pink-50'
            },
            { 
              icon: <Globe className="w-10 h-10" />, 
              value: '25+', 
              label: 'Countries', 
              description: 'Global reach',
              color: 'from-orange-600 to-red-500',
              bgColor: 'from-orange-50 to-red-50'
            },
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl transform group-hover:scale-105 transition-transform duration-300`}></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl mb-6 text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                
                <div className="space-y-3">
                  <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900">
                    {stat.label}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teacher Excellence Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 lg:p-12 shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Teacher Qualities */}
            <div>
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
                Our Educators
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-6">
                Learn from the{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Best Teachers
                </span>
              </h3>
              
              <p className="text-blue-100 mb-8 leading-relaxed">
                Every educator is carefully selected, certified, and trained to deliver exceptional learning experiences tailored to your needs.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <GraduationCap className="w-5 h-5" />, text: 'Advanced degrees from top universities' },
                  { icon: <Award className="w-5 h-5" />, text: 'Years of proven teaching experience' },
                  { icon: <BookOpen className="w-5 h-5" />, text: 'Modern teaching methods & technology' },
                  { icon: <Globe className="w-5 h-5" />, text: 'Multilingual & culturally diverse' },
                  { icon: <Star className="w-5 h-5" />, text: 'Personalized attention for every student' },
                  { icon: <CheckCircle className="w-5 h-5" />, text: 'Continuous professional development' }
                ].map((quality, index) => (
                  <div key={index} className="flex items-center space-x-3 text-blue-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center text-gray-900">
                      {quality.icon}
                    </div>
                    <span>{quality.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Stats & Subjects */}
            <div className="space-y-8">
              {/* Teacher Stats */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '150+', label: 'Expert Teachers' },
                  { value: '100%', label: 'Certified' },
                  { value: '15+ Yrs', label: 'Avg Experience' },
                  { value: '4.9/5', label: 'Rating' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                    <div className="text-white font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Subject Expertise */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
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
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-blue-100 text-sm">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link href="/auth/register">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold px-10 py-6 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Users className="w-6 h-6 mr-2" />
                    Start Learning Today
                  </Button>
                </Link>
                <p className="text-blue-200 text-sm mt-4">Join 2,500+ students worldwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <Clock className="w-8 h-8 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">300K+</div>
              <div className="text-blue-100">Teaching Hours</div>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div>
              <BookOpen className="w-8 h-8 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Courses Available</div>
            </div>
            <div>
              <Award className="w-8 h-8 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Learning Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
