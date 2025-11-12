'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Filter,
  Award,
  Clock,
  PlayCircle,
  CheckCircle,
  Download,
  Star,
  Bookmark
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

// Mock data
const mockCourses = [
  {
    id: 'c1',
    title: 'Advanced Mathematics',
    category: 'Mathematics',
    grade: 'Grade 10',
    thumbnail: '/courses/math.jpg',
    progress: 75,
    lessonsCompleted: 15,
    totalLessons: 20,
    averageGrade: 92,
    lastAccessed: '2024-01-22T14:30:00',
    status: 'in_progress',
    instructor: 'Prof. Anderson',
    isBookmarked: true,
    hasCertificate: false
  },
  {
    id: 'c2',
    title: 'Physics Fundamentals',
    category: 'Science',
    grade: 'Grade 9',
    thumbnail: '/courses/physics.jpg',
    progress: 60,
    lessonsCompleted: 15,
    totalLessons: 25,
    averageGrade: 88,
    lastAccessed: '2024-01-21T16:45:00',
    status: 'in_progress',
    instructor: 'Dr. Smith',
    isBookmarked: false,
    hasCertificate: false
  },
  {
    id: 'c3',
    title: 'Chemistry Basics',
    category: 'Science',
    grade: 'Grade 9',
    thumbnail: '/courses/chemistry.jpg',
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    averageGrade: 85,
    lastAccessed: '2024-01-20T10:20:00',
    status: 'in_progress',
    instructor: 'Dr. Johnson',
    isBookmarked: true,
    hasCertificate: false
  },
  {
    id: 'c4',
    title: 'English Literature',
    category: 'Language Arts',
    grade: 'Grade 10',
    thumbnail: '/courses/english.jpg',
    progress: 100,
    lessonsCompleted: 15,
    totalLessons: 15,
    averageGrade: 95,
    lastAccessed: '2024-01-15T14:00:00',
    status: 'completed',
    instructor: 'Prof. Williams',
    isBookmarked: false,
    hasCertificate: true
  }
]

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'in_progress' && course.status === 'in_progress') ||
      (activeTab === 'completed' && course.status === 'completed') ||
      (activeTab === 'bookmarked' && course.isBookmarked)
    
    return matchesSearch && matchesCategory && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <Link href="/courses">
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">
                  All ({mockCourses.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress">
                  In Progress ({mockCourses.filter(c => c.status === 'in_progress').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({mockCourses.filter(c => c.status === 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="bookmarked">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Bookmarked ({mockCourses.filter(c => c.isBookmarked).length})
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Language Arts">Language Arts</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Accessed</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
                      <CardContent className="p-0">
                        {/* Thumbnail */}
                        <div className="relative h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                          {course.hasCertificate && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-yellow-500 text-white">
                                <Award className="w-3 h-3 mr-1" />
                                Certified
                              </Badge>
                            </div>
                          )}
                          {course.isBookmarked && (
                            <div className="absolute top-2 left-2">
                              <Bookmark className="w-5 h-5 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {/* Title and Category */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{course.category}</Badge>
                                <Badge variant="outline">{course.grade}</Badge>
                              </div>
                            </div>
                          </div>

                          {/* Instructor */}
                          <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div>
                              <p className="text-gray-600">Lessons</p>
                              <p className="font-semibold">
                                {course.lessonsCompleted}/{course.totalLessons}
                              </p>
                            </div>
                            {course.averageGrade && (
                              <div>
                                <p className="text-gray-600">Avg Grade</p>
                                <p className="font-semibold">{course.averageGrade}%</p>
                              </div>
                            )}
                          </div>

                          {/* Last Accessed */}
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                            <Clock className="w-3 h-3" />
                            <span>Last accessed {new Date(course.lastAccessed).toLocaleDateString()}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {course.status === 'completed' && course.hasCertificate ? (
                              <>
                                <Link href={`/dashboard/student/courses/${course.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full">
                                    View Details
                                  </Button>
                                </Link>
                                <Button className="flex-1">
                                  <Download className="w-4 h-4 mr-2" />
                                  Certificate
                                </Button>
                              </>
                            ) : (
                              <>
                                <Link href={`/dashboard/student/courses/${course.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full">
                                    View Details
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/student/learn/${course.id}`} className="flex-1">
                                  <Button className="w-full">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Continue
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Link href="/courses">
                    <Button>
                      Browse Available Courses
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
