'use client'

import { useState } from 'react'
import { 
  Search,
  Download,
  MessageSquare,
  Eye,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

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
}

interface StudentProgressTableProps {
  students: Student[]
  onViewProfile?: (studentId: string) => void
  onMessage?: (studentId: string) => void
  onViewProgress?: (studentId: string) => void
  onExport?: () => void
  onBulkMessage?: (studentIds: string[]) => void
}

export function StudentProgressTable({
  students,
  onViewProfile,
  onMessage,
  onViewProgress,
  onExport,
  onBulkMessage
}: StudentProgressTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [progressFilter, setProgressFilter] = useState('all')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFilter = true
    if (progressFilter === 'high') matchesFilter = student.progress >= 70
    else if (progressFilter === 'medium') matchesFilter = student.progress >= 40 && student.progress < 70
    else if (progressFilter === 'low') matchesFilter = student.progress < 40

    return matchesSearch && matchesFilter
  })

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-green-600'
    if (progress >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle>Enrolled Students ({filteredStudents.length})</CardTitle>
          
          <div className="flex flex-wrap gap-2">
            {selectedStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkMessage?.(selectedStudents)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Selected ({selectedStudents.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={progressFilter} onValueChange={setProgressFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="high">High Progress (70%+)</SelectItem>
              <SelectItem value="medium">Medium Progress (40-70%)</SelectItem>
              <SelectItem value="low">Low Progress (&lt;40%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">
                  <Checkbox
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Enrolled</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quiz Avg</th>
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
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {student.enrolledAt}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${getProgressColor(student.progress)}`}>
                          {student.progress}%
                        </span>
                        <span className="text-gray-500 text-xs">
                          {student.completedLessons}/{student.totalLessons}
                        </span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {student.lastActivity}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getProgressColor(student.quizAverage)}`}>
                      {student.quizAverage}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProgress?.(student.id)}
                      >
                        View Progress
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No students found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
