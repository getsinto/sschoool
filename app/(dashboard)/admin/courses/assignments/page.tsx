'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Users,
  BookOpen,
  Filter,
  Download,
  Search,
  Star,
  CheckCircle2,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

interface Assignment {
  id: string
  course: {
    id: string
    title: string
    status: string
  }
  teacher: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  is_primary_teacher: boolean
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  assigned_at: string
  assigned_by: string
}

interface AssignmentStats {
  total_assignments: number
  primary_teachers: number
  content_managers: number
  graders: number
  communicators: number
  active_courses: number
  total_teachers: number
}

interface TeacherWorkload {
  teacher_id: string
  teacher_name: string
  total_courses: number
  primary_courses: number
  secondary_courses: number
  permissions: {
    can_manage_content: number
    can_grade: number
    can_communicate: number
  }
}

export default function AssignmentsOverviewPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<AssignmentStats | null>(null)
  const [workload, setWorkload] = useState<TeacherWorkload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterPermission, setFilterPermission] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/courses/assignments')
      // const data = await response.json()
      
      // Mock data for demonstration
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          course: { id: 'c1', title: 'Mathematics Grade 10', status: 'published' },
          teacher: { id: 't1', name: 'Dr. Sarah Johnson', email: 'sarah@school.com' },
          is_primary_teacher: true,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          assigned_at: '2024-01-15',
          assigned_by: 'admin1'
        },
        {
          id: '2',
          course: { id: 'c1', title: 'Mathematics Grade 10', status: 'published' },
          teacher: { id: 't2', name: 'Prof. Michael Chen', email: 'michael@school.com' },
          is_primary_teacher: false,
          can_manage_content: false,
          can_grade: true,
          can_communicate: false,
          assigned_at: '2024-01-16',
          assigned_by: 'admin1'
        },
        {
          id: '3',
          course: { id: 'c2', title: 'English Literature', status: 'published' },
          teacher: { id: 't1', name: 'Dr. Sarah Johnson', email: 'sarah@school.com' },
          is_primary_teacher: false,
          can_manage_content: true,
          can_grade: false,
          can_communicate: true,
          assigned_at: '2024-01-17',
          assigned_by: 'admin1'
        },
      ]

      const mockStats: AssignmentStats = {
        total_assignments: 3,
        primary_teachers: 1,
        content_managers: 2,
        graders: 2,
        communicators: 2,
        active_courses: 2,
        total_teachers: 2
      }

      const mockWorkload: TeacherWorkload[] = [
        {
          teacher_id: 't1',
          teacher_name: 'Dr. Sarah Johnson',
          total_courses: 2,
          primary_courses: 1,
          secondary_courses: 1,
          permissions: {
            can_manage_content: 2,
            can_grade: 1,
            can_communicate: 2
          }
        },
        {
          teacher_id: 't2',
          teacher_name: 'Prof. Michael Chen',
          total_courses: 1,
          primary_courses: 0,
          secondary_courses: 1,
          permissions: {
            can_manage_content: 0,
            can_grade: 1,
            can_communicate: 0
          }
        }
      ]

      setAssignments(mockAssignments)
      setStats(mockStats)
      setWorkload(mockWorkload)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Convert assignments to CSV
    const headers = ['Course', 'Teacher', 'Role', 'Manage Content', 'Grade', 'Communicate', 'Assigned Date']
    const rows = filteredAssignments.map(a => [
      a.course.title,
      a.teacher.name,
      a.is_primary_teacher ? 'Primary' : 'Secondary',
      a.can_manage_content ? 'Yes' : 'No',
      a.can_grade ? 'Yes' : 'No',
      a.can_communicate ? 'Yes' : 'No',
      new Date(a.assigned_at).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course-assignments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTeacher = filterTeacher === 'all' || assignment.teacher.id === filterTeacher
    const matchesCourse = filterCourse === 'all' || assignment.course.id === filterCourse
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'primary' && assignment.is_primary_teacher) ||
      (filterRole === 'secondary' && !assignment.is_primary_teacher)
    
    const matchesPermission = filterPermission === 'all' ||
      (filterPermission === 'content' && assignment.can_manage_content) ||
      (filterPermission === 'grade' && assignment.can_grade) ||
      (filterPermission === 'communicate' && assignment.can_communicate)

    return matchesSearch && matchesTeacher && matchesCourse && matchesRole && matchesPermission
  })

  // Get unique teachers and courses for filters
  const uniqueTeachers = Array.from(new Set(assignments.map(a => a.teacher.id)))
    .map(id => assignments.find(a => a.teacher.id === id)?.teacher)
    .filter(Boolean)
  
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.course.id)))
    .map(id => assignments.find(a => a.course.id === id)?.course)
    .filter(Boolean)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Assignments</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all teacher assignments across the platform
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total_assignments}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Primary Teachers</p>
                  <p className="text-3xl font-bold text-green-600">{stats.primary_teachers}</p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.active_courses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.total_teachers}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search courses or teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {uniqueTeachers.map(teacher => (
                  <SelectItem key={teacher!.id} value={teacher!.id}>
                    {teacher!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map(course => (
                  <SelectItem key={course!.id} value={course!.id}>
                    {course!.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="primary">Primary Teachers</SelectItem>
                <SelectItem value="secondary">Secondary Teachers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPermission} onValueChange={setFilterPermission}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Permissions</SelectItem>
                <SelectItem value="content">Can Manage Content</SelectItem>
                <SelectItem value="grade">Can Grade</SelectItem>
                <SelectItem value="communicate">Can Communicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Assignments ({filteredAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.course.title}</div>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          {assignment.course.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.teacher.name}</div>
                        <div className="text-sm text-gray-500">{assignment.teacher.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.is_primary_teacher ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Secondary
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {assignment.can_manage_content && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Content
                          </Badge>
                        )}
                        {assignment.can_grade && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Grade
                          </Badge>
                        )}
                        {assignment.can_communicate && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Communicate
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Teacher Workload Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workload.map((teacher) => (
              <div key={teacher.teacher_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{teacher.teacher_name}</h4>
                    <p className="text-sm text-gray-600">
                      {teacher.total_courses} total courses ({teacher.primary_courses} primary, {teacher.secondary_courses} secondary)
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {teacher.total_courses} courses
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {teacher.permissions.can_manage_content}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Content Management</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {teacher.permissions.can_grade}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Grading</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {teacher.permissions.can_communicate}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Communication</div>
                  </div>
                </div>

                {/* Workload indicator */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Workload</span>
                    <span className="font-medium">
                      {teacher.total_courses <= 3 ? 'Light' : teacher.total_courses <= 6 ? 'Moderate' : 'Heavy'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        teacher.total_courses <= 3 ? 'bg-green-500' :
                        teacher.total_courses <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((teacher.total_courses / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
