'use client'

import { useState, useMemo } from 'react'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import SharedLayout from '@/components/layout/SharedLayout'
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Mock course data - in real app, this would come from API
const allCourses = [
  {
    id: 1,
    title: 'Mathematics - Grade 10',
    slug: 'mathematics-grade-10',
    description: 'Complete mathematics curriculum covering algebra, geometry, and trigonometry',
    category: 'online-school',
    gradeLevel: 'Grade 10',
    subject: 'Mathematics',
    thumbnail: '/api/placeholder/300/200',
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    enrolled: 1250,
    duration: '6 months',
    lessons: 48,
    difficulty: 'Intermediate',
    instructor: 'Dr. Sarah Johnson',
    isPopular: true,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'English Literature - Grade 11',
    slug: 'english-literature-grade-11',
    description: 'Explore classic and contemporary literature with expert analysis',
    category: 'online-school',
    gradeLevel: 'Grade 11',
    subject: 'English',
    thumbnail: '/api/placeholder/300/200',
    price: 249,
    originalPrice: 329,
    rating: 4.9,
    enrolled: 980,
    duration: '5 months',
    lessons: 40,
    difficulty: 'Advanced',
    instructor: 'Prof. Michael Brown',
    isPopular: false,
    createdAt: '2024-02-01',
  },
  {
    id: 3,
    title: 'English Speaking for Beginners',
    slug: 'english-speaking-beginners',
    description: 'Build confidence in English conversation from the ground up',
    category: 'spoken-english',
    gradeLevel: 'All Levels',
    subject: 'English',
    thumbnail: '/api/placeholder/300/200',
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    enrolled: 2100,
    duration: '3 months',
    lessons: 36,
    difficulty: 'Beginner',
    instructor: 'Sarah Mitchell',
    isPopular: true,
    createdAt: '2024-01-20',
  },
  {
    id: 4,
    title: 'SAT Preparation Course',
    slug: 'sat-preparation',
    description: 'Comprehensive SAT prep with practice tests and strategies',
    category: 'tuition',
    gradeLevel: 'Grade 12',
    subject: 'Test Prep',
    thumbnail: '/api/placeholder/300/200',
    price: 449,
    originalPrice: 599,
    rating: 4.9,
    enrolled: 567,
    duration: '4 months',
    lessons: 60,
    difficulty: 'Advanced',
    instructor: 'Dr. Jennifer Lee',
    isPopular: true,
    createdAt: '2024-01-10',
  },
  {
    id: 5,
    title: 'Physics - Grade 12',
    slug: 'physics-grade-12',
    description: 'Advanced physics concepts with practical experiments and simulations',
    category: 'online-school',
    gradeLevel: 'Grade 12',
    subject: 'Physics',
    thumbnail: '/api/placeholder/300/200',
    price: 349,
    originalPrice: 449,
    rating: 4.7,
    enrolled: 756,
    duration: '8 months',
    lessons: 56,
    difficulty: 'Advanced',
    instructor: 'Dr. Emily Chen',
    isPopular: false,
    createdAt: '2024-02-15',
  },
  {
    id: 6,
    title: 'Business English Communication',
    slug: 'business-english-communication',
    description: 'Professional English for workplace and business settings',
    category: 'spoken-english',
    gradeLevel: 'All Levels',
    subject: 'English',
    thumbnail: '/api/placeholder/300/200',
    price: 299,
    originalPrice: 379,
    rating: 4.8,
    enrolled: 1450,
    duration: '4 months',
    lessons: 32,
    difficulty: 'Intermediate',
    instructor: 'James Thompson',
    isPopular: false,
    createdAt: '2024-01-25',
  },
]

const ITEMS_PER_PAGE = 9

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
      const matchesGrade = selectedGradeLevel === 'all' || course.gradeLevel === selectedGradeLevel
      const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject
      const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty
      
      let matchesPrice = true
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number)
        matchesPrice = course.price >= (min || 0) && (max ? course.price <= max : true)
      }
      
      return matchesSearch && matchesCategory && matchesGrade && matchesSubject && matchesDifficulty && matchesPrice
    })

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.enrolled - a.enrolled
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedGradeLevel, selectedSubject, priceRange, selectedDifficulty, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedGradeLevel('all')
    setSelectedSubject('all')
    setPriceRange('all')
    setSelectedDifficulty('all')
    setCurrentPage(1)
  }

  return (
    <SharedLayout>
      <div className="bg-white">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Course{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Catalog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive collection of courses designed to help you achieve 
              your academic and professional goals.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="online-school">Online School</SelectItem>
                <SelectItem value="spoken-english">Spoken English</SelectItem>
                <SelectItem value="tuition">Tuition</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Grade Level" />
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

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Test Prep">Test Prep</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-100">$0 - $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="200-300">$200 - $300</SelectItem>
                <SelectItem value="300-500">$300 - $500</SelectItem>
                <SelectItem value="500">$500+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={clearFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
            </p>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedCourses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.isPopular && (
                        <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600">
                          Popular
                        </Badge>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700">
                          {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.gradeLevel}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolled.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lessons} lessons</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            ${course.price}
                          </span>
                          {course.originalPrice > course.price && (
                            <span className="text-lg text-gray-500 line-through">
                              ${course.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Enroll Now
                        </Button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          Instructor: <span className="font-medium">{course.instructor}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to find more courses.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      </div>
    </SharedLayout>
  )
}