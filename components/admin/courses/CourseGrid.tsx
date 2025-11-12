'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Star,
  Users,
  DollarSign,
  Play,
  Settings,
  TrendingUp,
  BookOpen,
  Plus
} from 'lucide-react'

interface Course {
  id: string
  title: string
  thumbnail: string
  category: 'online-school' | 'spoken-english' | 'tuition'
  grade: string
  subject: string
  teacher: {
    id: string
    name: string
    avatar?: string
  }
  price: number
  enrollments: number
  status: 'draft' | 'published' | 'archived'
  createdDate: string
  lastUpdated: string
  rating: number
  revenue: number
  completionRate: number
  featured: boolean
}

interface CourseGridProps {
  courses: Course[]
  selectedCourses: string[]
  onSelectionChange: (selected: string[]) => void
  isLoading: boolean
}

const getCategoryBadge = (category: string) => {
  const categoryConfig = {
    'online-school': { color: 'bg-blue-100 text-blue-800', label: 'Online School' },
    'spoken-english': { color: 'bg-green-100 text-green-800', label: 'Spoken English' },
    'tuition': { color: 'bg-purple-100 text-purple-800', label: 'Tuition' }
  }
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig['online-school']
  return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    published: { color: 'bg-green-100 text-green-800', label: 'Published' },
    draft: { color: 'bg-orange-100 text-orange-800', label: 'Draft' },
    archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
  }
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
}

export default function CourseGrid({ courses, selectedCourses, onSelectionChange, isLoading }: CourseGridProps) {
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCourses, courseId])
    } else {
      onSelectionChange(selectedCourses.filter(id => id !== courseId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(courses.map(course => course.id))
    } else {
      onSelectionChange([])
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={selectedCourses.length === courses.length && courses.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-gray-600">
          Select all ({courses.length} courses)
        </span>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course.id} 
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden relative"
            onMouseEnter={() => setHoveredCourse(course.id)}
            onMouseLeave={() => setHoveredCourse(null)}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedCourses.includes(course.id)}
                onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Featured Badge */}
            {course.featured && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay on hover */}
              {hoveredCourse === course.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute bottom-3 left-3">
                {getStatusBadge(course.status)}
              </div>
            </div>

            <CardContent className="p-4">
              {/* Category and Grade */}
              <div className="flex items-center justify-between mb-2">
                {getCategoryBadge(course.category)}
                <span className="text-xs text-gray-500">{course.grade}</span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>

              {/* Teacher */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  {course.teacher.avatar ? (
                    <img 
                      src={course.teacher.avatar} 
                      alt={course.teacher.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">
                      {course.teacher.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">{course.teacher.name}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{course.enrollments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">${course.price}</span>
                </div>
                {course.status === 'published' && (
                  <>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">{course.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{course.completionRate}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Revenue (for published courses) */}
              {course.status === 'published' && course.revenue > 0 && (
                <div className="mb-4 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Revenue</span>
                    <span className="font-semibold text-green-800">
                      ${course.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Link href={`/dashboard/admin/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/admin/courses/${course.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Publish/Unpublish */}
                {course.status === 'draft' ? (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Publish
                  </Button>
                ) : course.status === 'published' ? (
                  <Button variant="outline" size="sm">
                    Unpublish
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Last Updated */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Updated {new Date(course.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria to find more courses.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </div>
      )}
    </div>
  )
}