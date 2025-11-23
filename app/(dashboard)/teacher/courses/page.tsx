'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Grid3x3, 
  List, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  BarChart3,
  Copy,
  Archive,
  Star,
  Users,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import Image from 'next/image'

// Mock data
const mockCourses = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    thumbnail: '/course-thumbnails/math.jpg',
    category: 'Mathematics',
    grade: 'Grade 10',
    subject: 'Algebra',
    enrollments: 245,
    rating: 4.8,
    revenue: 12450,
    status: 'published',
    lastUpdated: '2024-01-10'
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    thumbnail: '/course-thumbnails/physics.jpg',
    category: 'Science',
    grade: 'Grade 9',
    subject: 'Physics',
    enrollments: 189,
    rating: 4.6,
    revenue: 9450,
    status: 'published',
    lastUpdated: '2024-01-08'
  },
  {
    id: '3',
    title: 'English Literature',
    thumbnail: '/course-thumbnails/english.jpg',
    category: 'Language',
    grade: 'Grade 8',
    subject: 'English',
    enrollments: 312,
    rating: 4.9,
    revenue: 15600,
    status: 'published',
    lastUpdated: '2024-01-12'
  },
  {
    id: '4',
    title: 'Chemistry Basics',
    thumbnail: '/course-thumbnails/chemistry.jpg',
    category: 'Science',
    grade: 'Grade 9',
    subject: 'Chemistry',
    enrollments: 156,
    rating: 4.5,
    revenue: 7800,
    status: 'draft',
    lastUpdated: '2024-01-05'
  }
]

export default function TeacherCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage and track your courses</p>
        </div>
        <Link href="/teacher/courses/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="enrolled">Most Enrolled</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-20">
                    {course.title.charAt(0)}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Category Info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.grade}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.subject}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{course.enrollments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-600">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">{course.revenue}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/teacher/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Last Updated */}
                  <p className="text-xs text-gray-500 mt-3">
                    Updated {course.lastUpdated}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Enrollments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold">
                            {course.title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.grade} • {course.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{course.category}</td>
                      <td className="py-3 px-4 text-gray-600">{course.enrollments}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-600">{course.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">${course.revenue}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/teacher/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
