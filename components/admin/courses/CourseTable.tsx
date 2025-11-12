'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  TrendingUp,
  BookOpen,
  Plus,
  ArrowUpDown
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

interface CourseTableProps {
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

export default function CourseTable({ courses, selectedCourses, onSelectionChange, isLoading }: CourseTableProps) {
  const [sortField, setSortField] = useState<keyof Course>('createdDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(courses.map(course => course.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCourses, courseId])
    } else {
      onSelectionChange(selectedCourses.filter(id => id !== courseId))
    }
  }

  const handleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCourses = [...courses].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4">
              <Checkbox
                checked={selectedCourses.length === courses.length && courses.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="text-left p-4 font-medium text-gray-900">Course</th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center space-x-1">
                <span>Category</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </th>
            <th className="text-left p-4 font-medium text-gray-900">Teacher</th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center space-x-1">
                <span>Price</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('enrollments')}
            >
              <div className="flex items-center space-x-1">
                <span>Enrollments</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('revenue')}
            >
              <div className="flex items-center space-x-1">
                <span>Revenue</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </th>
            <th className="text-left p-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCourses.map((course) => (
            <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4">
                <Checkbox
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                />
              </td>
              
              {/* Course Info */}
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                      {course.featured && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{course.grade}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{course.subject}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="p-4">
                {getCategoryBadge(course.category)}
              </td>

              {/* Teacher */}
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {course.teacher.avatar ? (
                      <img 
                        src={course.teacher.avatar} 
                        alt={course.teacher.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        {course.teacher.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{course.teacher.name}</span>
                </div>
              </td>

              {/* Price */}
              <td className="p-4">
                <span className="font-medium text-gray-900">${course.price}</span>
              </td>

              {/* Enrollments */}
              <td className="p-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{course.enrollments}</span>
                </div>
              </td>

              {/* Revenue */}
              <td className="p-4">
                {course.status === 'published' && course.revenue > 0 ? (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-600">
                      ${course.revenue.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              {/* Status */}
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(course.status)}
                  {course.status === 'published' && course.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="p-4">
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
                  
                  {/* Publish/Unpublish */}
                  {course.status === 'draft' ? (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-2">
                      Publish
                    </Button>
                  ) : course.status === 'published' ? (
                    <Button variant="outline" size="sm" className="ml-2">
                      Unpublish
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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