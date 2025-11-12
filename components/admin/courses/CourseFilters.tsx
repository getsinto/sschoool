'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X } from 'lucide-react'

interface Filters {
  category: string
  grade: string
  subject: string
  status: string
  teacher: string
}

interface CourseFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function CourseFilters({ filters, onFiltersChange }: CourseFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      grade: 'all',
      subject: 'all',
      status: 'all',
      teacher: 'all'
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all')
  const activeFilterCount = Object.values(filters).filter(value => value !== 'all').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="online-school">Online School</SelectItem>
              <SelectItem value="spoken-english">Spoken English</SelectItem>
              <SelectItem value="tuition">Tuition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grade Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Grade Level</label>
          <Select value={filters.grade} onValueChange={(value) => updateFilter('grade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="Grade 5">Grade 5</SelectItem>
              <SelectItem value="Grade 6">Grade 6</SelectItem>
              <SelectItem value="Grade 7">Grade 7</SelectItem>
              <SelectItem value="Grade 8">Grade 8</SelectItem>
              <SelectItem value="Grade 9">Grade 9</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
              <SelectItem value="All Levels">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
          <Select value={filters.subject} onValueChange={(value) => updateFilter('subject', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Geography">Geography</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Test Prep">Test Prep</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Teacher</label>
          <Select value={filters.teacher} onValueChange={(value) => updateFilter('teacher', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              <SelectItem value="t1">Dr. Sarah Johnson</SelectItem>
              <SelectItem value="t2">Prof. Michael Brown</SelectItem>
              <SelectItem value="t3">James Thompson</SelectItem>
              <SelectItem value="t4">Dr. Jennifer Lee</SelectItem>
              <SelectItem value="t5">Dr. Emily Chen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="pt-4 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Filters</label>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => updateFilter('status', 'draft')}
            >
              Draft Courses
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  status: 'published',
                  category: 'all',
                  grade: 'all',
                  subject: 'all',
                  teacher: 'all'
                })
              }}
            >
              Published Courses
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  category: 'online-school',
                  status: 'all',
                  grade: 'all',
                  subject: 'all',
                  teacher: 'all'
                })
              }}
            >
              Online School
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  category: 'spoken-english',
                  status: 'all',
                  grade: 'all',
                  subject: 'all',
                  teacher: 'all'
                })
              }}
            >
              Spoken English
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value === 'all') return null
                return (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {value}
                    <button
                      onClick={() => updateFilter(key as keyof Filters, 'all')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}