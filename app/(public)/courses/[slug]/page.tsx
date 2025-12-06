'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StaticLayout from '@/components/layout/StaticLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PricingDisplay from '@/components/public/course/PricingDisplay'
import BatchSelector from '@/components/public/course/BatchSelector'
import EnrollmentStatus from '@/components/public/course/EnrollmentStatus'
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  FileText,
  MessageCircle,
  Share2,
  Heart,
  ChevronRight,
  Globe,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import type { CoursePricingConfig, CourseBatch } from '@/types/pricing'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<CourseBatch | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [slug])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/courses/slug/${slug}`)
      // const data = await response.json()
      
      // Mock data for now
      const mockCourse = {
        id: '1',
        title: 'Complete Web Development Bootcamp',
        slug: 'complete-web-development-bootcamp',
        description: 'Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and launch your career as a full-stack developer.',
        long_description: 'This comprehensive bootcamp covers everything you need to become a professional web developer. Starting from the basics of HTML and CSS, you\'ll progress through JavaScript, modern frameworks like React, backend development with Node.js, databases, and deployment. Each module includes hands-on projects, quizzes, and assignments to reinforce your learning.',
        thumbnail_url: '/api/placeholder/800/400',
        category: 'Web Development',
        subject: 'Programming',
        grade_level: 'All Levels',
        difficulty: 'Beginner to Advanced',
        language: 'English',
        instructor: {
          name: 'Dr. Sarah Johnson',
          title: 'Senior Software Engineer',
          avatar: '/api/placeholder/100/100',
          bio: '10+ years of experience in web development and teaching',
          rating: 4.9,
          students: 50000,
          courses: 12
        },
        rating: 4.8,
        total_ratings: 2450,
        enrolled_students: 12500,
        duration: '6 months',
        total_lessons: 156,
        total_hours: 45,
        last_updated: '2024-12-15',
        
        // Pricing configuration
        pricing: {
          pricing_model: 'one_time',
          price: 299,
          currency: 'USD',
          payment_plan_enabled: true,
          payment_plan_installments: 3,
          payment_plan_frequency: 'monthly',
          early_bird_enabled: true,
          early_bird_price: 249,
          early_bird_deadline: '2025-02-01',
          regular_price: 299,
          max_students: 100,
          current_enrollments: 87,
          enable_waitlist: true,
          access_duration_type: 'lifetime',
          is_batch_based: true
        } as CoursePricingConfig,
        
        // Batches
        batches: [
          {
            id: 'batch-1',
            course_id: '1',
            batch_name: 'January 2025 Cohort',
            batch_number: 5,
            start_date: '2025-01-15',
            end_date: '2025-07-15',
            registration_opens: '2024-12-01',
            registration_closes: '2025-01-10',
            schedule_days: ['monday', 'wednesday', 'friday'],
            schedule_time: '18:00',
            timezone: 'EST',
            max_students: 50,
            current_enrollments: 42,
            status: 'registration_open',
            created_at: '2024-11-01',
            updated_at: '2024-12-01'
          },
          {
            id: 'batch-2',
            course_id: '1',
            batch_name: 'March 2025 Cohort',
            batch_number: 6,
            start_date: '2025-03-01',
            end_date: '2025-09-01',
            registration_opens: '2025-01-15',
            registration_closes: '2025-02-25',
            schedule_days: ['tuesday', 'thursday'],
            schedule_time: '19:00',
            timezone: 'EST',
            max_students: 50,
            current_enrollments: 15,
            status: 'upcoming',
            created_at: '2024-11-01',
            updated_at: '2024-12-01'
          }
        ] as CourseBatch[],
        
        // Course content
        curriculum: [
          {
            section: 'Introduction to Web Development',
            lessons: 12,
            duration: '3 hours',
            topics: ['HTML Basics', 'CSS Fundamentals', 'Responsive Design', 'Flexbox & Grid']
          },
          {
            section: 'JavaScript Essentials',
            lessons: 18,
            duration: '5 hours',
            topics: ['Variables & Data Types', 'Functions', 'DOM Manipulation', 'ES6+ Features']
          },
          {
            section: 'React Framework',
            lessons: 24,
            duration: '8 hours',
            topics: ['Components', 'State & Props', 'Hooks', 'Context API', 'React Router']
          },
          {
            section: 'Backend Development',
            lessons: 20,
            duration: '7 hours',
            topics: ['Node.js', 'Express', 'REST APIs', 'Authentication']
          },
          {
            section: 'Databases & Deployment',
            lessons: 16,
            duration: '5 hours',
            topics: ['MongoDB', 'PostgreSQL', 'AWS', 'Vercel', 'CI/CD']
          }
        ],
        
        // What you'll learn
        learning_outcomes: [
          'Build responsive websites from scratch using HTML, CSS, and JavaScript',
          'Create modern web applications with React and Next.js',
          'Develop RESTful APIs with Node.js and Express',
          'Work with databases like MongoDB and PostgreSQL',
          'Deploy applications to cloud platforms',
          'Implement authentication and authorization',
          'Follow industry best practices and coding standards',
          'Build a professional portfolio with real-world projects'
        ],
        
        // Requirements
        requirements: [
          'A computer with internet connection',
          'Basic computer skills',
          'Willingness to learn and practice',
          'No prior programming experience required'
        ],
        
        // Features
        features: [
          'Lifetime access to course materials',
          '156 video lessons',
          '50+ coding exercises',
          '10 real-world projects',
          'Certificate of completion',
          'Direct instructor support',
          'Private student community',
          'Job placement assistance'
        ]
      }
      
      setCourse(mockCourse)
      if (mockCourse.batches && mockCourse.batches.length > 0) {
        setSelectedBatch(mockCourse.batches[0])
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = () => {
    if (course?.pricing?.is_batch_based && !selectedBatch) {
      alert('Please select a batch to enroll')
      return
    }
    
    // TODO: Navigate to checkout
    router.push(`/checkout?course=${course.id}&batch=${selectedBatch?.id || ''}`)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: API call to add/remove from wishlist
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <StaticLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StaticLayout>
    )
  }

  if (!course) {
    return (
      <StaticLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
            <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/courses')}>
              Browse All Courses
            </Button>
          </div>
        </div>
      </StaticLayout>
    )
  }

  return (
    <StaticLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.difficulty}</Badge>
                  {course.pricing.early_bird_enabled && new Date(course.pricing.early_bird_deadline!) > new Date() && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      Early Bird Offer
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(course.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-gray-600">({course.total_ratings} ratings)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{course.enrolled_students.toLocaleString()} students</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{course.total_hours} hours</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-5 h-5" />
                    <span>{course.total_lessons} lessons</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-5 h-5" />
                    <span>{course.language}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                    <p className="text-sm text-gray-600">{course.instructor.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleWishlist}
                    variant="outline"
                    className="gap-2"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handleShare}
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Right: Pricing Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      
                      <PricingDisplay
                        pricing={course.pricing}
                        currency={course.pricing.currency}
                      />
                    </div>
                    
                    {course.pricing.is_batch_based && course.batches && (
                      <div className="mb-6">
                        <BatchSelector
                          batches={course.batches}
                          selectedBatch={selectedBatch}
                          onSelectBatch={setSelectedBatch}
                        />
                      </div>
                    )}
                    
                    <EnrollmentStatus
                      maxStudents={course.pricing.max_students}
                      currentEnrollments={course.pricing.current_enrollments}
                      enableWaitlist={course.pricing.enable_waitlist}
                      registrationDeadline={selectedBatch?.registration_closes}
                    />
                    
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 mb-4"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                {/* What You'll Learn */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learning_outcomes.map((outcome: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Course Description */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {course.long_description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Requirements */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                    <ul className="space-y-3">
                      {course.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Features */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                    <div className="space-y-4">
                      {course.curriculum.map((section: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Section {index + 1}: {section.section}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{section.lessons} lessons</span>
                              <span>{section.duration}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {section.topics.map((topic: string, topicIndex: number) => (
                              <Badge key={topicIndex} variant="secondary">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6 mb-6">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-24 h-24 rounded-full"
                      />
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {course.instructor.name}
                        </h2>
                        <p className="text-lg text-gray-600 mb-4">{course.instructor.title}</p>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.instructor.rating}</span>
                            <span className="text-gray-600">Instructor Rating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">{course.instructor.students.toLocaleString()}</span>
                            <span className="text-gray-600">Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">{course.instructor.courses}</span>
                            <span className="text-gray-600">Courses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {course.instructor.bio}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
                    <div className="text-center py-12 text-gray-500">
                      Reviews coming soon...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </StaticLayout>
  )
}
