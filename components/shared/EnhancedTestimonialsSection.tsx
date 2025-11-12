'use client'

import { useState } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, Users, Award, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Testimonial {
  id: string
  name: string
  role: string
  photo: string
  childGrade?: string
  quote: string
  rating: number
  location: string
  course: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Parent',
    photo: '/images/testimonials/parent1.jpg',
    childGrade: 'Grade 10',
    quote: 'The quality of education and personal attention my daughter receives is exceptional. The teachers are truly dedicated to student success and the interactive classes keep her engaged throughout every lesson. We\'ve seen remarkable improvement in her grades and confidence.',
    rating: 5,
    location: 'New York, USA',
    course: 'Online School Classes'
  },
  {
    id: '2',
    name: 'Ahmed Al-Rashid',
    role: 'Student',
    photo: '/images/testimonials/student1.jpg',
    quote: 'St Haroon Online School helped me improve my English significantly. The interactive classes and supportive teachers made all the difference in my learning journey. Now I speak with confidence and have made friends from around the world!',
    rating: 5,
    location: 'Dubai, UAE',
    course: 'Spoken English Course'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    role: 'Parent',
    photo: '/images/testimonials/parent2.jpg',
    childGrade: 'Grade 8',
    quote: 'Flexible scheduling and excellent curriculum. My son loves the live classes and has shown remarkable improvement in all subjects. The teachers are patient, understanding, and always available to help with any questions.',
    rating: 5,
    location: 'Madrid, Spain',
    course: 'Online School Classes'
  },
  {
    id: '4',
    name: 'David Chen',
    role: 'Parent',
    photo: '/images/testimonials/parent3.jpg',
    childGrade: 'Grade 6',
    quote: 'The personalized learning approach and regular progress reports help us stay involved in our child\'s education. The teachers are professional, caring, and truly invested in student success. Best decision we made!',
    rating: 5,
    location: 'Toronto, Canada',
    course: 'Online Tuition'
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'Parent',
    photo: '/images/testimonials/parent4.jpg',
    childGrade: 'Pre-Nursery',
    quote: 'My 4-year-old daughter absolutely loves her online classes! The teachers make learning fun and engaging with games and activities. She looks forward to every session and has learned so much already.',
    rating: 5,
    location: 'Mumbai, India',
    course: 'Online School Classes'
  },
  {
    id: '6',
    name: 'Emma Thompson',
    role: 'Adult Student',
    photo: '/images/testimonials/student2.jpg',
    quote: 'As a working professional, I needed flexible English classes that fit my schedule. St Haroon\'s adult English program was perfect! The business English focus helped me advance in my career.',
    rating: 5,
    location: 'London, UK',
    course: 'Spoken English Course'
  }
]

export default function EnhancedTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Reviews', count: testimonials.length },
    { id: 'parents', label: 'Parents', count: testimonials.filter(t => t.role === 'Parent').length },
    { id: 'students', label: 'Students', count: testimonials.filter(t => t.role === 'Student' || t.role === 'Adult Student').length }
  ]

  const filteredTestimonials = selectedCategory === 'all' 
    ? testimonials 
    : testimonials.filter(t => 
        selectedCategory === 'parents' ? t.role === 'Parent' : 
        (t.role === 'Student' || t.role === 'Adult Student')
      )

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length)
  }

  const currentTestimonial = filteredTestimonials[currentIndex]

  if (!currentTestimonial) return null

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200/20 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our Happy{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Parents & Students
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Hear from our successful students and parents about their transformative learning journey with us. 
            Real stories from real families around the world.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setCurrentIndex(0)
                }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Photo and Info */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 rounded-full blur-lg" />
                </div>
                
                <div className="relative z-10">
                  {/* Photo */}
                  <div className="w-32 h-32 mx-auto lg:mx-0 mb-6 relative">
                    <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                      {currentTestimonial.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 rounded-full p-2">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-bold mb-2">{currentTestimonial.name}</h3>
                    <p className="text-blue-100 mb-1">{currentTestimonial.role}</p>
                    {currentTestimonial.childGrade && (
                      <p className="text-blue-200 text-sm mb-2">Child in {currentTestimonial.childGrade}</p>
                    )}
                    <p className="text-blue-200 text-sm mb-4">{currentTestimonial.location}</p>
                    
                    {/* Course Badge */}
                    <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border border-white/30">
                      {currentTestimonial.course}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Quote */}
              <div className="p-8 lg:p-12 relative">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-blue-100">
                  <Quote className="w-16 h-16" />
                </div>
                
                <div className="relative z-10">
                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < currentTestimonial.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-3 text-gray-600 font-medium">
                      {currentTestimonial.rating}.0 out of 5
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                    "{currentTestimonial.quote}"
                  </blockquote>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPrevious}
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <span className="text-gray-500 text-sm">
                        {currentIndex + 1} of {filteredTestimonials.length}
                      </span>
                      
                      <button
                        onClick={goToNext}
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Verified Review</div>
                      <div className="flex items-center text-green-600 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Authentic Student
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and CTA */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid md:grid-cols-4 gap-8 items-center mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <p className="text-gray-600">Average Rating</p>
              <div className="flex justify-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <p className="text-gray-600">Success Stories</p>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Become part of our global community of successful learners and experience the difference quality education makes.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
                Enroll Now - Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}