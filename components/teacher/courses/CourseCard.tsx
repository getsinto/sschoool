'use client'

import { Star, Users, DollarSign, MoreVertical, Eye, Edit, BarChart3, Copy, Archive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface CourseCardProps {
  course: {
    id: string
    title: string
    subtitle?: string
    thumbnail?: string
    category: string
    grade: string
    subject: string
    language?: string
    age_groups?: string[]
    student_types?: string[]
    enrollments: number
    rating: number
    revenue: number
    status: string
    lastUpdated: string
  }
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
}

export function CourseCard({ course, onEdit, onDuplicate, onArchive }: CourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
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
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {course.subtitle}
          </p>
        )}

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
          {course.language && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {course.language}
            </Badge>
          )}
        </div>

        {/* Age Groups */}
        {course.age_groups && course.age_groups.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.age_groups.map((ageGroup) => (
              <Badge key={ageGroup} variant="secondary" className="text-xs">
                {ageGroup}
              </Badge>
            ))}
          </div>
        )}

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
              <DropdownMenuItem onClick={() => onEdit?.(course.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(course.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onArchive?.(course.id)}>
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
  )
}
