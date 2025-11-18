'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Printer,
  Filter,
  Search,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock data
const mockGradebook = {
  course: {
    id: 'course_1',
    name: 'Grade 10 Mathematics',
    term: 'Fall 2024'
  },
  assignments: [
    { id: 'a1', name: 'Quiz 1', type: 'quiz', maxScore: 100, weight: 10 },
    { id: 'a2', name: 'Assignment 1', type: 'assignment', maxScore: 50, weight: 15 },
    { id: 'a3', name: 'Midterm Exam', type: 'exam', maxScore: 100, weight: 25 },
    { id: 'a4', name: 'Quiz 2', type: 'quiz', maxScore: 100, weight: 10 },
    { id: 'a5', name: 'Final Project', type: 'project', maxScore: 100, weight: 40 }
  ],
  students: [
    {
      id: 's1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: '/avatars/sarah.jpg',
      grades: { a1: 95, a2: 48, a3: 88, a4: 92, a5: 95 }
    },
    {
      id: 's2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      avatar: '/avatars/michael.jpg',
      grades: { a1: 88, a2: 45, a3: 85, a4: 90, a5: 88 }
    },
    {
      id: 's3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: '/avatars/emma.jpg',
      grades: { a1: 92, a2: 42, a3: 90, a4: 88, a5: 92 }
    },
    {
      id: 's4',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      avatar: '/avatars/alex.jpg',
      grades: { a1: 78, a2: 38, a3: 75, a4: 80, a5: 78 }
    },
    {
      id: 's5',
      name: 'Jessica Lee',
      email: 'jessica@example.com',
      avatar: '/avatars/jessica.jpg',
      grades: { a1: 85, a2: 40, a3: 82, a4: 87, a5: 90 }
    }
  ]
}

export default function GradebookPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('course_1')
  const [sortBy, setSortBy] = useState('name')

  const calculateAverage = (grades: {[key: string]: number}) => {
    const assignments = mockGradebook.assignments
    let totalWeightedScore = 0
    let totalWeight = 0

    assignments.forEach(assignment => {
      const grade = grades[assignment.id]
      if (grade !== undefined) {
        const percentage = (grade / assignment.maxScore) * 100
        totalWeightedScore += percentage * assignment.weight
        totalWeight += assignment.weight
      }
    })

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'bg-green-100 text-green-800'
    if (percentage >= 80) return 'bg-blue-100 text-blue-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    if (percentage >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const filteredStudents = mockGradebook.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting to CSV...')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Book</h1>
          <p className="text-gray-600 mt-1">{mockGradebook.course.name} - {mockGradebook.course.term}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGradebook.students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGradebook.assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockGradebook.students.reduce((sum, s) => sum + calculateAverage(s.grades), 0) /
                mockGradebook.students.length
              )}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                (mockGradebook.students.filter(s => calculateAverage(s.grades) >= 70).length /
                mockGradebook.students.length) * 100
              )}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="average-high">Average (High-Low)</SelectItem>
            <SelectItem value="average-low">Average (Low-High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gradebook Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Student</TableHead>
                  {mockGradebook.assignments.map(assignment => (
                    <TableHead key={assignment.id} className="text-center min-w-[100px]">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{assignment.name}</span>
                        <span className="text-xs text-gray-500">({assignment.weight}%)</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold min-w-[100px]">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => {
                  const average = calculateAverage(student.grades)
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="sticky left-0 bg-white">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      {mockGradebook.assignments.map(assignment => {
                        const grade = student.grades[assignment.id]
                        return (
                          <TableCell key={assignment.id} className="text-center">
                            {grade !== undefined ? (
                              <Badge className={getGradeColor(grade, assignment.maxScore)}>
                                {grade}/{assignment.maxScore}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(average, 100)} variant="outline">
                          {average}%
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
