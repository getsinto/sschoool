'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AssignmentCard from '@/components/student/assignments/AssignmentCard'

// Mock data
const mockAssignments = [
  {
    id: 'a1',
    title: 'Quadratic Equations Problem Set',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    dueDate: '2024-02-01T23:59:00',
    maxPoints: 50,
    status: 'not_started',
    grade: null,
    submittedAt: null,
    description: 'Complete all 10 problems showing your work'
  },
  {
    id: 'a2',
    title: 'Newton\'s Laws Lab Report',
    courseId: 'c2',
    courseName: 'Physics Fundamentals',
    dueDate: '2024-01-28T23:59:00',
    maxPoints: 100,
    status: 'draft_saved',
    grade: null,
    submittedAt: null,
    description: 'Write a comprehensive lab report'
  },
  {
    id: 'a3',
    title: 'Shakespeare Essay',
    courseId: 'c3',
    courseName: 'English Literature',
    dueDate: '2024-01-25T23:59:00',
    maxPoints: 75,
    status: 'submitted',
    grade: null,
    submittedAt: '2024-01-24T14:30:00',
    description: 'Analyze themes in Hamlet'
  },
  {
    id: 'a4',
    title: 'World War II Timeline',
    courseId: 'c4',
    courseName: 'World History',
    dueDate: '2024-01-20T23:59:00',
    maxPoints: 60,
    status: 'graded',
    grade: 56,
    submittedAt: '2024-01-19T16:45:00',
    feedback: 'Excellent work! Very detailed timeline.',
    description: 'Create a detailed timeline of major events'
  },
  {
    id: 'a5',
    title: 'Chemical Reactions Worksheet',
    courseId: 'c5',
    courseName: 'Chemistry Basics',
    dueDate: '2024-01-15T23:59:00',
    maxPoints: 40,
    status: 'graded',
    grade: 38,
    submittedAt: '2024-01-15T10:20:00',
    feedback: 'Good understanding of concepts',
    description: 'Balance chemical equations'
  },
  {
    id: 'a6',
    title: 'Algebra Review Assignment',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    dueDate: '2024-01-10T23:59:00',
    maxPoints: 30,
    status: 'late',
    grade: 24,
    submittedAt: '2024-01-12T08:15:00',
    feedback: 'Late submission. Good work otherwise.',
    description: 'Review problems from chapters 1-3'
  }
]

const mockStats = {
  pending: 2,
  submitted: 1,
  graded: 3,
  averageGrade: 88.5
}

export default function AssignmentsPage() {
  const [assignments] = useState(mockAssignments)
  const [stats] = useState(mockStats)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Get unique courses
  const courses = Array.from(new Set(assignments.map(a => a.courseName)))

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCourse = filterCourse === 'all' || assignment.courseName === filterCourse
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'upcoming' && ['not_started', 'draft_saved'].includes(assignment.status)) ||
                        (activeTab === 'submitted' && assignment.status === 'submitted') ||
                        (activeTab === 'graded' && ['graded', 'late'].includes(assignment.status))
      
      return matchesSearch && matchesCourse && matchesStatus && matchesTab
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else if (sortBy === 'course') {
        return a.courseName.localeCompare(b.courseName)
      } else if (sortBy === 'grade') {
        return (b.grade || 0) - (a.grade || 0)
      }
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Assignments</h1>
        <p className="text-gray-600">Track and manage your course assignments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted</p>
                <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Graded</p>
                <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageGrade}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
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
                placeholder="Search assignments..."
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
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="draft_saved">Draft Saved</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AssignmentCard assignment={assignment} />
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No assignments found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterCourse !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You have no assignments in this category'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
