'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import SharedLayout from '@/components/layout/SharedLayout'
import SchoolHeroSlider from '@/components/shared/SchoolHeroSlider'
import VideoSection from '@/components/shared/VideoSection'
import EnhancedTestimonialsSection from '@/components/shared/EnhancedTestimonialsSection'
import EnhancedBrochureSection from '@/components/shared/EnhancedBrochureSection'
import EnhancedWhyChooseSection from '@/components/shared/EnhancedWhyChooseSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import AchievementsAndTeachersSection from '@/components/landing/AchievementsAndTeachersSection'
import CourseCard from '@/components/shared/CourseCard'
import { Button } from '@/components/ui/button'
import { GraduationCap, MessageCircle, BookOpen, Star, Award, Globe, CheckCircle, ArrowRight, Users, Clock, Sparkles, TrendingUp, Target } from 'lucide-react'
import Link from 'next/link'
import './landing-animations.css'

export default function LandingPage() {
  return (
    <SharedLayout>
      {/* School Hero Slider */}
      <SchoolHeroSlider />

      {/* Video Demo Section */}
      <VideoSection />

      {/* Course Categories Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 fade-in-section">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 pulse-glow">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent gradient-animate">
                Course Categories
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Choose from our comprehensive range of educational programs designed to meet diverse learning needs 
              and unlock your full potential with world-class instruction.
            </p>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">1000+</span>
                <span className="text-gray-600">Students</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">4.9/5</span>
                <span className="text-gray-600">Rating</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">50+</span>
                <span className="text-gray-600">Teachers</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="fade-in-section" style={{ transitionDelay: '0.1s' }}>
              <CourseCard
                title="Online School Classes"
                description="Comprehensive curriculum for Pre-Nursery to 10th Grade with live interactive classes, certified teachers, and personalized learning paths."
                image="/images/courses/online-school.jpg"
                icon={<GraduationCap className="w-8 h-8 text-blue-600" />}
                href="/courses/online-school"
                stats={{ students: 800, duration: 'Full Year', rating: 4.9 }}
                features={[
                  "Pre-Nursery to Grade 10",
                  "Live Interactive Classes",
                  "Certified Teachers",
                  "Personalized Learning"
                ]}
              />
            </div>

            <div className="fade-in-section" style={{ transitionDelay: '0.2s' }}>
              <CourseCard
                title="Online Tuition"
                description="Grade-wise academic support and tutoring to help students excel in their studies with one-on-one attention."
                image="/images/courses/online-tuition.jpg"
                icon={<BookOpen className="w-8 h-8 text-green-600" />}
                href="/courses/tuition"
                stats={{ students: 300, duration: 'Flexible', rating: 4.8 }}
                features={[
                  "One-on-One Tutoring",
                  "Grade-wise Support",
                  "Flexible Scheduling",
                  "Progress Tracking"
                ]}
              />
            </div>

            <div className="fade-in-section" style={{ transitionDelay: '0.3s' }}>
              <CourseCard
                title="Spoken English Courses"
                description="English speaking courses for all age groups focusing on conversation, pronunciation, and confidence building."
                image="/images/courses/spoken-english.jpg"
                icon={<MessageCircle className="w-8 h-8 text-orange-600" />}
                href="/courses/spoken-english"
                stats={{ students: 500, duration: '3-6 Months', rating: 4.9 }}
                features={[
                  "All Age Groups",
                  "Conversation Practice",
                  "Pronunciation Training",
                  "Confidence Building"
                ]}
              />
            </div>
          </div>

          {/* Enhanced CTA */}
          <div className="text-center fade-in-section">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-10 border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden group">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Transform Your Learning Experience?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                  Join thousands of successful students and start your educational journey today with our expert teachers and proven curriculum.
                </p>
                <Link href="/auth/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-lg px-12 py-6 shadow-lg hover:shadow-2xl transition-all duration-300 group/btn gradient-animate">
                    <Award className="w-6 h-6 mr-2 group-hover/btn:rotate-12 transition-transform" />
                    Enroll Now - Start Your Journey
                    <ArrowRight className="w-6 h-6 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements & Teachers Combined Section */}
      <AchievementsAndTeachersSection />

      {/* Spoken English Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-green-300/20 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 fade-in-section">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-6 pulse-glow">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Spoken English Course for{' '}
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 bg-clip-text text-transparent gradient-animate">
                All Age Groups
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Master English speaking with confidence through our specialized programs designed for different age groups 
              and proficiency levels. From kids to seniors, we have the perfect course for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Content - Age Groups */}
            <div className="space-y-6">
              {[
                { emoji: '🧒', title: 'Kids English (6-12 years)', subtitle: 'Fun & Interactive Learning', features: ['Interactive Games', 'Story-based Learning', 'Fun Activities', 'Age-appropriate Content'] },
                { emoji: '👦', title: 'Teen English (13-17 years)', subtitle: 'Confidence Building', features: ['Confidence Building', 'Peer Interaction', 'Real-world Scenarios', 'Academic Support'] },
                { emoji: '👨‍💼', title: 'Adult English (18+ years)', subtitle: 'Professional Communication', features: ['Business English', 'Career Development', 'Professional Communication', 'Interview Prep'] },
              ].map((course, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 fade-in-section group" style={{ transitionDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-3xl mr-4 group-hover:rotate-12 transition-transform duration-300">
                      {course.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      <p className="text-green-600 font-medium">{course.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.features.map((feature, idx) => (
                      <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Content - Benefits */}
            <div className="space-y-8 fade-in-section" style={{ transitionDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-green-100 via-blue-100 to-teal-100 rounded-3xl p-8 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="w-8 h-8 text-yellow-500 mr-3 animate-pulse" />
                  Why Choose Our Spoken English Program?
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: <Globe className="w-6 h-6 text-blue-500" />, text: "Native and certified English instructors from around the world" },
                    { icon: <Award className="w-6 h-6 text-purple-500" />, text: "International curriculum aligned with global standards" },
                    { icon: <CheckCircle className="w-6 h-6 text-green-500" />, text: "Flexible scheduling to fit your busy lifestyle" },
                    { icon: <Star className="w-6 h-6 text-yellow-500" />, text: "Certification upon successful course completion" },
                    { icon: <MessageCircle className="w-6 h-6 text-indigo-500" />, text: "Interactive conversation practice with peers" },
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-all duration-300 group">
                      <div className="group-hover:scale-110 transition-transform">
                        {benefit.icon}
                      </div>
                      <span className="text-gray-700">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg px-10 py-6 shadow-lg hover:shadow-2xl transition-all duration-300 group gradient-animate">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Enroll Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <EnhancedTestimonialsSection />



      {/* Enhanced Brochure Section */}
      <EnhancedBrochureSection />



      {/* Enhanced Why Choose Us Section */}
      <EnhancedWhyChooseSection />

      {/* Enroll Now CTA after Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 relative overflow-hidden gradient-animate">
        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl float-animation" />
          <div className="absolute bottom-10 right-20 w-56 h-56 bg-yellow-300/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center fade-in-section">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border-2 border-white/30">
              <Target className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Enroll Now
            </h3>
            <p className="text-xl sm:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Experience excellence in online education with personalized learning
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-16 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 group font-bold hover:scale-105">
                <TrendingUp className="w-6 h-6 mr-3 group-hover:translate-y-[-4px] transition-transform" />
                Enroll Now
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl float-animation" />
          <div className="absolute top-32 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl float-animation" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 right-10 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl float-animation" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 fade-in-section">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 border-2 border-white/30 pulse-glow">
                <Star className="w-12 h-12 text-yellow-300 animate-pulse" />
              </div>
              
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Ready to Start Your{' '}
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent gradient-animate">
                  Learning Journey?
                </span>
              </h2>
              
              <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed mb-8">
                Join thousands of students who have transformed their education with St Haroon Online School. 
                Experience world-class learning with personalized attention and proven results.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-12 fade-in-section" style={{ transitionDelay: '0.2s' }}>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <Users className="w-6 h-6 text-green-300" />
                  <span className="font-bold">1000+</span>
                  <span className="text-sm">Students</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <Star className="w-6 h-6 text-yellow-300" />
                  <span className="font-bold">4.9/5</span>
                  <span className="text-sm">Rating</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <Award className="w-6 h-6 text-pink-300" />
                  <span className="font-bold">Free Trial</span>
                  <span className="text-sm">Available</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 fade-in-section" style={{ transitionDelay: '0.3s' }}>
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-xl px-14 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:scale-110"
                >
                  <Award className="w-7 h-7 mr-3 group-hover:rotate-12 transition-transform" />
                  Enroll Now
                  <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 text-xl px-14 py-7 backdrop-blur-sm group hover:scale-110 transition-all duration-300"
                >
                  <MessageCircle className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 fade-in-section group" style={{ transitionDelay: '0.4s' }}>
                <Clock className="w-14 h-14 text-blue-300 mx-auto mb-4 group-hover:rotate-12 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Flexible Schedule</h3>
                <p className="text-indigo-100">Choose your preferred class timings</p>
              </div>
              
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 fade-in-section group" style={{ transitionDelay: '0.5s' }}>
                <Users className="w-14 h-14 text-green-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Expert Teachers</h3>
                <p className="text-indigo-100">Learn from certified professionals</p>
              </div>
              
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 fade-in-section group" style={{ transitionDelay: '0.6s' }}>
                <Star className="w-14 h-14 text-yellow-300 mx-auto mb-4 group-hover:rotate-180 transition-transform duration-500" />
                <h3 className="text-2xl font-bold mb-2">Proven Results</h3>
                <p className="text-indigo-100">95% student success rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SharedLayout>
  )
}