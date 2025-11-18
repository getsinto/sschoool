'use client'

import { useState } from 'react'
import { Search, Download, MessageSquare, Eye, Filter } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  enrolledAt: string
  progress: number
  lastActivity: string
  quizAverage: number
  completedLessons: number
  totalLessons: number
  status: 'active' | 'at-risk' | 'completed'
}

interface StudentProgressTableProps {
  students: Student[]
  onViewProfile?: (studentId: string) => void
  onMessage?: (studentId: string) => void
  onViewProgress?: (studentId: string) => void
  onBulkMessage?: (studentIds: string[]) => void
  onExport?: () => void
}

export function StudentProgressTable({
  students: initialStudents,
  onViewProfile,
  onMessage,
  onViewProgress,
  onBulkMessage,
  onExport
}: StudentProgressTableProps) {
  const [students, setStudents] = useState(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'at-risk': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuizColor = (average: number) => {
    if (average >= 90) return 'text-green-600'
    if (average >= 70) return 'text-blue-600'
    if (average >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAll = () => {
    setSelectedStudents(
      selectedStudents.length === students.length
        ? []
        : students.map(s => s.id)
    )
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-900">
            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            onClick={() => onBulkMessage?.(selectedStudents)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">
                  <Checkbox
                    checked={selectedStudents.length === students.length}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Enrolled</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quiz Avg</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{student.enrolledAt}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{student.progress}%</span>
                        <span className="text-xs text-gray-500">
                          {student.completedLessons}/{student.totalLessons}
                        </span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{student.lastActivity}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${getQuizColor(student.quizAverage)}`}>
                      {student.quizAverage}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProfile?.(student.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessage?.(student.id)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {filteredStudents.filter(s => s.status === 'active').length}
          </p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {filteredStudents.filter(s => s.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {filteredStudents.filter(s => s.status === 'at-risk').length}
          </p>
          <p className="text-sm text-gray-600">At Risk</p>
        </div>
      </div>
    </div>
  )
}
