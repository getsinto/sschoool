'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  PlayCircle,
  BookOpen,
  Clock,
  Users,
  Award,
  Star,
  Download,
  CheckCircle,
  Lock,
  FileText,
  Video,
  HelpCircle,
  Calendar,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

// Mock course data
const mockCourseData = {
  id: 'c1',
  title: 'Advanced Mathematics - Quadratic Equations',
  description: 'Master the fundamentals of quadratic equations, including factoring, completing the square, and using the quadratic formula. This comprehensive course will prepare you for advanced mathematical concepts.',
  category: 'Mathematics',
  grade: 'Grade 10',
  thumbnail: '/courses/math.jpg',
  instructor: {
    name: 'Prof. Anderson',
    avatar: '/avatars/prof-anderson.jpg',
    bio: 'Mathematics Professor with 15+ years of teaching experience'
  },
  rating: 4.8,
  totalStudents: 1250,
  duration: '8 weeks',
  level: 'Intermediate',
  progress: 75,
  status: 'in_progress',
  hasCertificate: false,
  objectives: [
    'Understand the structure and properties of quadratic equations',
    'Master factoring techniques for different types of quadratics',
    'Apply the quadratic formula to solve complex problems',
    'Graph quadratic functions and interpret their behavior',
    'Solve real-world problems using quadratic equations'
  ],
  prerequisites: [
    'Basic algebra skills',
    'Understanding of linear equations',
    'Familiarity with coordinate geometry'
  ],
  curriculum: [
    {
      id: 's1',
      title: 'Introduction to Quadratic Equations',
      lessons: [
        {
          id: 'l1',
          title: 'What are Quadratic Equations?',
          type: 'video',
          duration: '15 min',
          completed: true,
          locked: false
        },
        {
          id: 'l2',
          title: 'Standard Form vs Vertex Form',
          type: 'video',
          duration: '20 min',
          completed: true,
          locked: false
        },
        {
          id: 'l3',
          title: 'Practice Problems - Basic Forms',
          type: 'quiz',
          duration: '10 min',
          completed: true,
          locked: false
        }
      ]
    },
    {
      id: 's2',
      title: 'Factoring Techniques',
      lessons: [
        {
          id: 'l4',
          title: 'Factoring by Grouping',
          type: 'video',
          duration: '25 min',
          completed: true,
          locked: false
        },
        {
          id: 'l5',
          title: 'Special Factoring Patterns',
          type: 'document',
          duration: '15 min',
          completed: false,
          locked: false,
          current: true
        },
        {
          id: 'l6',
          title: 'Factoring Assignment',
          type: 'assignment',
          duration: '45 min',
          completed: false,
          locked: false
        }
      ]
    },
    {
      id: 's3',
      title: 'The Quadratic Formula',
      lessons: [
        {
          id: 'l7',
          title: 'Deriving the Quadratic Formula',
          type: 'video',
          duration: '30 min',
          completed: false,
          locked: true
        },
        {
          id: 'l8',
          title: 'Using the Discriminant',
          type: 'video',
          duration: '20 min',
          completed: false,
          locked: true
        }
      ]
    }
  ],
  resources: [
    {
      id: 'r1',
      title: 'Quadratic Equations Cheat Sheet',
      type: 'pdf',
      size: '2.3 MB',
      downloadUrl: '/resources/quadratic-cheat-sheet.pdf'
    },
    {
      id: 'r2',
      title: 'Practice Problem Set',
      type: 'pdf',
      size: '1.8 MB',
      downloadUrl: '/resources/practice-problems.pdf'
    },
    {
      id: 'r3',
      title: 'Graphing Calculator Guide',
      type: 'link',
      url: 'https://example.com/calculator-guide'
    }
  ],
  announcements: [
    {
      id: 'a1',
      title: 'New Practice Problems Added',
      content: 'I\'ve added additional practice problems for factoring techniques. Check the resources section!',
      date: '2024-01-22',
      author: 'Prof. Anderson'
    },
    {
      id: 'a2',
      title: 'Office Hours This Week',
      content: 'I\'ll be available for questions on Wednesday 2-4 PM via video call.',
      date: '2024-01-20',
      author: 'Prof. Anderson'
    }
  ],
  stats: {
    totalLessons: 8,
    completedLessons: 4,
    totalQuizzes: 3,
    completedQuizzes: 2,
    averageQuizScore: 94,
    timeSpent: '12h 30m'
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  
  const courseId = params.id as string
  const course = mockCourseData

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'quiz': return <HelpCircle className="w-4 h-4" />
      case 'assignment': return <BookOpen className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getCurrentLesson = () => {
    for (const section of course.curriculum) {
      for (const lesson of section.lessons) {
        if (lesson.current) return lesson
        if (!lesson.completed && !lesson.locked) return lesson
      }
    }
    return null
  }

  const currentLesson = getCurrentLesson()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="outline">{course.grade}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.totalStudents} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{course.instructor.name}</p>
                  <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Your Progress</span>
                  <span className="font-semibold">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-3" />
              </div>
            </div>

            {/* Action Panel */}
            <div className="space-y-4">
              {course.status === 'completed' && course.hasCertificate ? (
                <Button className="w-full" size="lg">
                  <Award className="w-5 h-5 mr-2" />
                  Download Certificate
                </Button>
              ) : currentLesson ? (
                <Link href={`/dashboard/student/learn/${courseId}/${currentLesson.id}`}>
                  <Button className="w-full" size="lg">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {currentLesson.completed ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Course Completed
                </Button>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Lessons Completed</span>
                    <span className="font-semibold">{course.stats.completedLessons}/{course.stats.totalLessons}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quizzes Completed</span>
                    <span className="font-semibold">{course.stats.completedQuizzes}/{course.stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Quiz Score</span>
                    <span className="font-semibold">{course.stats.averageQuizScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Spent</span>
                    <span className="font-semibold">{course.stats.timeSpent}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{course.stats.totalLessons}</div>
                    <div className="text-sm text-gray-600">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{course.stats.completedLessons}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          {course.curriculum.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Section {sectionIndex + 1}: {section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        lesson.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${lesson.locked ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {lesson.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : lesson.locked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                          {getTypeIcon(lesson.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!lesson.locked && (
                          <Link href={`/dashboard/student/learn/${courseId}/${lesson.id}`}>
                            <Button variant={lesson.completed ? 'outline' : 'default'} size="sm">
                              {lesson.completed ? 'Review' : 'Start'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-gray-600">
                          {resource.type === 'pdf' ? `PDF • ${resource.size}` : 'External Link'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {resource.type === 'pdf' ? 'Download' : 'Open'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          {course.announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <div className="text-sm text-gray-600">
                    {new Date(announcement.date).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{announcement.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
