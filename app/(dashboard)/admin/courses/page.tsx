'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CourseGrid from '@/components/admin/courses/CourseGrid'
import CourseTable from '@/components/admin/courses/CourseTable'
import CourseFilters from '@/components/admin/courses/CourseFilters'
import { 
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  Download,
  RefreshCw,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp
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

// Mock course data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Mathematics Grade 10 - Advanced Algebra',
    thumbnail: '/api/placeholder/300/200',
    category: 'online-school',
    grade: 'Grade 10',
    subject: 'Mathematics',
    teacher: {
      id: 't1',
      name: 'Dr. Sarah Johnson',
      avatar: '/api/placeholder/40/40'
    },
    price: 299,
    enrollments: 245,
    status: 'published',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    rating: 4.8,
    revenue: 73255,
    completionRate: 78,
    featured: true
  },
  {
    id: '2',
    title: 'English Literature - Classic Novels',
    thumbnail: '/api/placeholder/300/200',
    category: 'online-school',
    grade: 'Grade 11',
    subject: 'English',
    teacher: {
      id: 't2',
      name: 'Prof. Michael Brown',
      avatar: '/api/placeholder/40/40'
    },
    price: 249,
    enrollments: 198,
    status: 'published',
    createdDate: '2024-01-10',
    lastUpdated: '2024-01-18',
    rating: 4.9,
    revenue: 49302,
    completionRate: 85,
    featured: false
  },
  {
    id: '3',
    title: 'Business English Communication',
    thumbnail: '/api/placeholder/300/200',
    category: 'spoken-english',
    grade: 'All Levels',
    subject: 'English',
    teacher: {
      id: 't3',
      name: 'James Thompson',
      avatar: '/api/placeholder/40/40'
    },
    price: 199,
    enrollments: 156,
    status: 'published',
    createdDate: '2024-01-08',
    lastUpdated: '2024-01-16',
    rating: 4.7,
    revenue: 31044,
    completionRate: 72,
    featured: true
  },
  {
    id: '4',
    title: 'SAT Preparation - Complete Guide',
    thumbnail: '/api/placeholder/300/200',
    category: 'tuition',
    grade: 'Grade 12',
    subject: 'Test Prep',
    teacher: {
      id: 't4',
      name: 'Dr. Jennifer Lee',
      avatar: '/api/placeholder/40/40'
    },
    price: 449,
    enrollments: 89,
    status: 'draft',
    createdDate: '2024-01-12',
    lastUpdated: '2024-01-19',
    rating: 0,
    revenue: 0,
    completionRate: 0,
    featured: false
  },
  {
    id: '5',
    title: 'Physics Grade 12 - Quantum Mechanics',
    thumbnail: '/api/placeholder/300/200',
    category: 'online-school',
    grade: 'Grade 12',
    subject: 'Physics',
    teacher: {
      id: 't5',
      name: 'Dr. Emily Chen',
      avatar: '/api/placeholder/40/40'
    },
    price: 349,
    enrollments: 67,
    status: 'published',
    createdDate: '2024-01-05',
    lastUpdated: '2024-01-17',
    rating: 4.6,
    revenue: 23383,
    completionRate: 68,
    featured: false
  }
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    grade: 'all',
    subject: 'all',
    status: 'all',
    teacher: 'all'
  })

  // Filter and sort courses
  useEffect(() => {
    let filtered = courses

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.category === filters.category)
    }
    if (filters.grade !== 'all') {
      filtered = filtered.filter(course => course.grade === filters.grade)
    }
    if (filters.subject !== 'all') {
      filtered = filtered.filter(course => course.subject === filters.subject)
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(course => course.status === filters.status)
    }
    if (filters.teacher !== 'all') {
      filtered = filtered.filter(course => course.teacher.id === filters.teacher)
    }

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        case 'popular':
          return b.enrollments - a.enrollments
        case 'enrollments':
          return b.enrollments - a.enrollments
        case 'revenue':
          return b.revenue - a.revenue
        case 'rating':
          return b.rating - a.rating
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredCourses(filtered)
  }, [courses, searchQuery, filters, sortBy])

  const handleBulkAction = (action: string) => {
    if (selectedCourses.length === 0) return
    
    console.log(`Bulk ${action}:`, selectedCourses)
    // In real app, call API for bulk actions
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getStatusStats = () => {
    return {
      total: courses.length,
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length,
      archived: courses.filter(c => c.status === 'archived').length
    }
  }

  const getTotalStats = () => {
    const published = courses.filter(c => c.status === 'published')
    return {
      totalEnrollments: published.reduce((sum, c) => sum + c.enrollments, 0),
      totalRevenue: published.reduce((sum, c) => sum + c.revenue, 0),
      avgRating: published.length > 0 ? published.reduce((sum, c) => sum + c.rating, 0) / published.length : 0,
      avgCompletion: published.length > 0 ? published.reduce((sum, c) => sum + c.completionRate, 0) / published.length : 0
    }
  }

  const statusStats = getStatusStats()
  const totalStats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage courses, track performance, and monitor enrollments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.location.href = '/admin/courses/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{statusStats.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {statusStats.published} published, {statusStats.draft} draft
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-green-600">{totalStats.totalEnrollments.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(totalStats.avgCompletion)}% avg completion
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${totalStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalStats.avgRating.toFixed(1)} avg rating
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Courses</p>
                <p className="text-3xl font-bold text-orange-600">
                  {courses.filter(c => c.featured).length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Promoted courses
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses by title or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="enrollments">Most Enrollments</SelectItem>
                <SelectItem value="revenue">Highest Revenue</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CourseFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Courses ({filteredCourses.length})
                </CardTitle>
                {selectedCourses.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedCourses.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('publish')}
                    >
                      Publish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('unpublish')}
                    >
                      Unpublish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <CourseGrid
                  courses={filteredCourses}
                  selectedCourses={selectedCourses}
                  onSelectionChange={setSelectedCourses}
                  isLoading={isLoading}
                />
              ) : (
                <CourseTable
                  courses={filteredCourses}
                  selectedCourses={selectedCourses}
                  onSelectionChange={setSelectedCourses}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}