'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import QuizCard from '@/components/student/quizzes/QuizCard'

// Mock data
const mockQuizzes = [
  {
    id: 'q1',
    title: 'Quadratic Equations - Mid-term Quiz',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    questionsCount: 15,
    duration: 30,
    maxPoints: 100,
    attempts: 2,
    maxAttempts: 3,
    bestScore: 94,
    lastScore: 94,
    passed: true,
    status: 'completed'
  },
  {
    id: 'q2',
    title: 'Newton\'s Laws Quiz',
    courseId: 'c2',
    courseName: 'Physics Fundamentals',
    questionsCount: 10,
    duration: 20,
    maxPoints: 50,
    attempts: 1,
    maxAttempts: 2,
    bestScore: 42,
    lastScore: 42,
    passed: true,
    status: 'completed'
  },
  {
    id: 'q3',
    title: 'Shakespeare Knowledge Check',
    courseId: 'c3',
    courseName: 'English Literature',
    questionsCount: 20,
    duration: 25,
    maxPoints: 80,
    attempts: 2,
    maxAttempts: 3,
    bestScore: 52,
    lastScore: 52,
    passed: false,
    status: 'failed'
  },
  {
    id: 'q4',
    title: 'World War II Quiz',
    courseId: 'c4',
    courseName: 'World History',
    questionsCount: 12,
    duration: 15,
    maxPoints: 60,
    attempts: 0,
    maxAttempts: 2,
    bestScore: null,
    lastScore: null,
    passed: null,
    status: 'available'
  },
  {
    id: 'q5',
    title: 'Chemical Reactions Test',
    courseId: 'c5',
    courseName: 'Chemistry Basics',
    questionsCount: 18,
    duration: 35,
    maxPoints: 90,
    attempts: 0,
    maxAttempts: 3,
    bestScore: null,
    lastScore: null,
    passed: null,
    status: 'available'
  }
]

const mockStats = {
  totalTaken: 3,
  averageScore: 78.5,
  passed: 2,
  needRetake: 1
}

export default function QuizzesPage() {
  const [quizzes] = useState(mockQuizzes)
  const [stats] = useState(mockStats)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Get unique courses
  const courses = Array.from(new Set(quizzes.map(q => q.courseName)))

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCourse = filterCourse === 'all' || quiz.courseName === filterCourse
      const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'passed' && quiz.passed === true) ||
                          (filterStatus === 'failed' && quiz.passed === false)
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'available' && quiz.status === 'available') ||
                        (activeTab === 'completed' && quiz.status === 'completed') ||
                        (activeTab === 'failed' && quiz.status === 'failed')
      
      return matchesSearch && matchesCourse && matchesStatus && matchesTab
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.bestScore || 0) - (a.bestScore || 0)
      } else if (sortBy === 'course') {
        return a.courseName.localeCompare(b.courseName)
      }
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
        <p className="text-gray-600">Track your quiz performance and retake failed quizzes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Taken</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTaken}</p>
              </div>
              <HelpCircle className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Passed</p>
                <p className="text-3xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Need Retake</p>
                <p className="text-3xl font-bold text-red-600">{stats.needRetake}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Course Filter */}
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Need Retake</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <QuizCard quiz={quiz} />
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterCourse !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You have no quizzes in this category'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
