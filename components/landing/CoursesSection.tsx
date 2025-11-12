'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Star, Users, Clock, BookOpen, Play } from 'lucide-react'
import Image from 'next/image'

const coursesData = {
  'online-school': [
    {
      id: 1,
      title: 'Mathematics - Grade 10',
      description: 'Complete mathematics curriculum covering algebra, geometry, and trigonometry',
      thumbnail: '/api/placeholder/300/200',
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      enrolled: 1250,
      duration: '6 months',
      lessons: 48,
      level: 'Intermediate',
      instructor: 'Dr. Sarah Johnson',
    },
    {
      id: 2,
      title: 'English Literature - Grade 11',
      description: 'Explore classic and contemporary literature with expert analysis',
      thumbnail: '/api/placeholder/300/200',
      price: 249,
      originalPrice: 329,
      rating: 4.9,
      enrolled: 980,
      duration: '5 months',
      lessons: 40,
      level: 'Advanced',
      instructor: 'Prof. Michael Brown',
    },
    {
      id: 3,
      title: 'Physics - Grade 12',
      description: 'Advanced physics concepts with practical experiments and simulations',
      thumbnail: '/api/placeholder/300/200',
      price: 349,
      originalPrice: 449,
      rating: 4.7,
      enrolled: 756,
      duration: '8 months',
      lessons: 56,
      level: 'Advanced',
      instructor: 'Dr. Emily Chen',
    },
    {
      id: 4,
      title: 'Chemistry - Grade 11',
      description: 'Comprehensive chemistry course with virtual lab experiments',
      thumbnail: '/api/placeholder/300/200',
      price: 299,
      originalPrice: 399,
      rating: 4.6,
      enrolled: 892,
      duration: '6 months',
      lessons: 44,
      level: 'Intermediate',
      instructor: 'Dr. Robert Wilson',
    },
    {
      id: 5,
      title: 'Biology - Grade 10',
      description: 'Life sciences with interactive diagrams and case studies',
      thumbnail: '/api/placeholder/300/200',
      price: 279,
      originalPrice: 359,
      rating: 4.8,
      enrolled: 1100,
      duration: '5 months',
      lessons: 42,
      level: 'Intermediate',
      instructor: 'Dr. Lisa Anderson',
    },
    {
      id: 6,
      title: 'Computer Science - Grade 12',
      description: 'Programming fundamentals and computer science principles',
      thumbnail: '/api/placeholder/300/200',
      price: 399,
      originalPrice: 499,
      rating: 4.9,
      enrolled: 654,
      duration: '7 months',
      lessons: 52,
      level: 'Advanced',
      instructor: 'Prof. David Kim',
    },
  ],
  'spoken-english': [
    {
      id: 7,
      title: 'English Speaking for Beginners',
      description: 'Build confidence in English conversation from the ground up',
      thumbnail: '/api/placeholder/300/200',
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      enrolled: 2100,
      duration: '3 months',
      lessons: 36,
      level: 'Beginner',
      instructor: 'Sarah Mitchell',
    },
    {
      id: 8,
      title: 'Business English Communication',
      description: 'Professional English for workplace and business settings',
      thumbnail: '/api/placeholder/300/200',
      price: 299,
      originalPrice: 379,
      rating: 4.8,
      enrolled: 1450,
      duration: '4 months',
      lessons: 32,
      level: 'Intermediate',
      instructor: 'James Thompson',
    },
    {
      id: 9,
      title: 'IELTS Preparation Course',
      description: 'Comprehensive IELTS exam preparation with practice tests',
      thumbnail: '/api/placeholder/300/200',
      price: 349,
      originalPrice: 449,
      rating: 4.9,
      enrolled: 890,
      duration: '6 months',
      lessons: 48,
      level: 'Advanced',
      instructor: 'Emma Roberts',
    },
    {
      id: 10,
      title: 'Pronunciation Mastery',
      description: 'Perfect your English pronunciation with phonetics training',
      thumbnail: '/api/placeholder/300/200',
      price: 179,
      originalPrice: 229,
      rating: 4.6,
      enrolled: 1680,
      duration: '2 months',
      lessons: 24,
      level: 'All Levels',
      instructor: 'Mark Johnson',
    },
    {
      id: 11,
      title: 'Advanced Conversation Skills',
      description: 'Fluency development through advanced conversation practice',
      thumbnail: '/api/placeholder/300/200',
      price: 249,
      originalPrice: 319,
      rating: 4.8,
      enrolled: 1200,
      duration: '4 months',
      lessons: 40,
      level: 'Advanced',
      instructor: 'Rachel Green',
    },
    {
      id: 12,
      title: 'English Grammar Fundamentals',
      description: 'Master English grammar rules with practical exercises',
      thumbnail: '/api/placeholder/300/200',
      price: 149,
      originalPrice: 199,
      rating: 4.5,
      enrolled: 2300,
      duration: '3 months',
      lessons: 30,
      level: 'Beginner',
      instructor: 'Tom Wilson',
    },
  ],
  'tuition': [
    {
      id: 13,
      title: 'SAT Preparation Course',
      description: 'Comprehensive SAT prep with practice tests and strategies',
      thumbnail: '/api/placeholder/300/200',
      price: 449,
      originalPrice: 599,
      rating: 4.9,
      enrolled: 567,
      duration: '4 months',
      lessons: 60,
      level: 'Advanced',
      instructor: 'Dr. Jennifer Lee',
    },
    {
      id: 14,
      title: 'ACT Test Preparation',
      description: 'Complete ACT preparation with personalized study plans',
      thumbnail: '/api/placeholder/300/200',
      price: 399,
      originalPrice: 529,
      rating: 4.8,
      enrolled: 423,
      duration: '3 months',
      lessons: 45,
      level: 'Advanced',
      instructor: 'Prof. Michael Davis',
    },
    {
      id: 15,
      title: 'AP Calculus Tutoring',
      description: 'Advanced Placement Calculus with expert guidance',
      thumbnail: '/api/placeholder/300/200',
      price: 349,
      originalPrice: 449,
      rating: 4.7,
      enrolled: 234,
      duration: '6 months',
      lessons: 48,
      level: 'Advanced',
      instructor: 'Dr. Anna Rodriguez',
    },
    {
      id: 16,
      title: 'College Application Support',
      description: 'Complete guidance for college applications and essays',
      thumbnail: '/api/placeholder/300/200',
      price: 299,
      originalPrice: 399,
      rating: 4.9,
      enrolled: 345,
      duration: '2 months',
      lessons: 16,
      level: 'All Levels',
      instructor: 'Sarah Williams',
    },
    {
      id: 17,
      title: 'AP Chemistry Intensive',
      description: 'Advanced Placement Chemistry with lab simulations',
      thumbnail: '/api/placeholder/300/200',
      price: 379,
      originalPrice: 479,
      rating: 4.6,
      enrolled: 189,
      duration: '7 months',
      lessons: 52,
      level: 'Advanced',
      instructor: 'Dr. Kevin Park',
    },
    {
      id: 18,
      title: 'Study Skills & Time Management',
      description: 'Essential skills for academic success and productivity',
      thumbnail: '/api/placeholder/300/200',
      price: 199,
      originalPrice: 259,
      rating: 4.8,
      enrolled: 678,
      duration: '2 months',
      lessons: 20,
      level: 'All Levels',
      instructor: 'Lisa Thompson',
    },
  ],
}

function CourseCard({ course }: { course: any }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      <div className="relative">
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/80" />
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90">
              {course.level}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500">
              {course.originalPrice > course.price && (
                <span className="line-through text-xs mr-1">${course.originalPrice}</span>
              )}
              ${course.price}
            </Badge>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.enrolled.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            by {course.instructor}
          </div>
          
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Enroll Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CoursesSection() {
  const [activeTab, setActiveTab] = useState('online-school')

  return (
    <section className="py-20 bg-gray-50" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explore Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Course Catalog
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive range of courses designed to help you achieve 
            your academic and professional goals.
          </p>
        </div>

        {/* Course Categories Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12 bg-white shadow-lg rounded-xl p-2">
            <TabsTrigger 
              value="online-school" 
              className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Online School
            </TabsTrigger>
            <TabsTrigger 
              value="spoken-english"
              className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Spoken English
            </TabsTrigger>
            <TabsTrigger 
              value="tuition"
              className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Tuition
            </TabsTrigger>
          </TabsList>

          {/* Course Content */}
          {Object.entries(coursesData).map(([category, courses]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  View All {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Courses
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Course Features */}
        <div className="mt-20 bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              What's Included in Every Course
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">HD Video Lessons</h4>
              <p className="text-gray-600 text-sm">High-quality recorded and live sessions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Study Materials</h4>
              <p className="text-gray-600 text-sm">Comprehensive notes and resources</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Support</h4>
              <p className="text-gray-600 text-sm">Direct access to instructors</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Certificates</h4>
              <p className="text-gray-600 text-sm">Verified completion certificates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}