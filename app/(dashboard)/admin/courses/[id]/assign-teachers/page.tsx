/**
 * Admin Teacher Assignment UI
 * Feature: course-assignment-permissions
 * 
 * Dedicated page for assigning teachers to a specific course
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Save
} from 'lucide-react'
import Image from 'next/image'

interface Teacher {
  id: string
  full_name: string
  email: string
  profile_image?: string
  subjects?: string[]
  experience_years?: number
  status: 'active' | 'inactive' | 'pending'
}

interface Course {
  id: string
  title: string
  description?: string
  subject: string
  grade_level: string
  status: 'draft' | 'published' | 'archived'
}

interface TeacherAssignment {
  teacher_id: string
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  is_primary_teacher: boolean
}

interface AssignTeachersPageProps {
  params: {
    id: string
  }
}

export default function AssignTeachersPage({ params }: AssignTeachersPageProps) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeachers, setSelectedTeachers] = useState<Map<string, TeacherAssignment>>(new Map())
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load course details
      const courseResponse = await fetch(`/api/admin/courses/${params.id}`)
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourse(courseData.course || courseData)
      }

      // Load current assignments
      const assignmentsResponse = await fetch(`/api/admin/courses/${params.id}/assign-teachers`)
      let assignmentsData: any = {}
      if (assignmentsResponse.ok) {
        assignmentsData = await assignmentsResponse.json()
        setCurrentAssignments(assignmentsData.assignments || assignmentsData.current_assignments || [])
      }

      // Load available teachers
      const teachersResponse = await fetch('/api/admin/users?role=teacher')
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json()
        const allTeachers = teachersData.users || teachersData.teachers || []
        
        // Filter out already assigned teachers
        const assignedIds = new Set((assignmentsData?.assignments || []).map((a: any) => a.teacher_id))
        const availableTeachers = allTeachers.filter((t: Teacher) => !assignedIds.has(t.id))
        setTeachers(availableTeachers)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setErrorMessages(['Failed to load course data. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const toggleTeacher = (teacherId: string) => {
    const newSelected = new Map(selectedTeachers)
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId)
    } else {
      newSelected.set(teacherId, {
        teacher_id: teacherId,
        can_manage_content: true,
        can_grade: true,
        can_communicate: true,
        is_primary_teacher: newSelected.size === 0 && currentAssignments.length === 0 // First teacher is primary if no existing assignments
      })
    }
    setSelectedTeachers(newSelected)
  }

  const updateTeacherPermission = (
    teacherId: string, 
    permission: keyof Omit<TeacherAssignment, 'teacher_id'>, 
    value: boolean
  ) => {
    const newSelected = new Map(selectedTeachers)
    const assignment = newSelected.get(teacherId)
    if (assignment) {
      // If setting as primary, unset all others
      if (permission === 'is_primary_teacher' && value) {
        newSelected.forEach((a, id) => {
          if (id !== teacherId) {
            a.is_primary_teacher = false
          }
        })
      }
      assignment[permission] = value
      newSelected.set(teacherId, assignment)
      setSelectedTeachers(newSelected)
    }
  }

  const handleAssignTeachers = async () => {
    if (selectedTeachers.size === 0) {
      setErrorMessages(['Please select at least one teacher to assign.'])
      return
    }

    setSaving(true)
    setSuccessMessage(null)
    setErrorMessages([])

    try {
      const assignments = Array.from(selectedTeachers.values())
      
      const response = await fetch(`/api/admin/courses/${params.id}/assign-teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to assign teachers')
      }

      // Show success/error messages
      const successCount = result.results?.filter((r: any) => r.success).length || assignments.length
      const failureCount = result.results?.filter((r: any) => !r.success).length || 0

      if (successCount > 0) {
        setSuccessMessage(`Successfully assigned ${successCount} teacher(s) to the course!`)
      }

      if (failureCount > 0) {
        const errors = result.results
          ?.filter((r: any) => !r.success)
          .map((r: any) => {
            const teacher = teachers.find(t => t.id === r.teacher_id)
            return `${teacher?.full_name || 'Teacher'}: ${r.error}`
          }) || []
        setErrorMessages(errors)
      }

      // Reload data and clear selections
      await loadData()
      setSelectedTeachers(new Map())

      // Auto-hide success message after 5 seconds
      if (successCount > 0) {
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (error: any) {
      console.error('Error assigning teachers:', error)
      setErrorMessages([error.message || 'Failed to assign teachers. Please try again.'])
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Teachers</h1>
            {course && (
              <p className="text-gray-600 mt-1">
                {course.title} • {course.subject} • Grade {course.grade_level}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errorMessages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-2">Assignment Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errorMessages.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Current Assignments Summary */}
      {currentAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {currentAssignments.length} teacher(s) currently assigned to this course.
              {currentAssignments.some((a: any) => a.is_primary_teacher) && (
                <span className="ml-2">
                  • Primary teacher: {currentAssignments.find((a: any) => a.is_primary_teacher)?.teacher?.full_name || 'Unknown'}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teacher Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Select Teachers to Assign
            </div>
            {selectedTeachers.size > 0 && (
              <Badge variant="secondary">
                {selectedTeachers.size} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teachers by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Teacher List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No teachers found matching your search.' : 'No available teachers to assign.'}
              </div>
            ) : (
              filteredTeachers.map((teacher) => {
                const isSelected = selectedTeachers.has(teacher.id)
                const assignment = selectedTeachers.get(teacher.id)

                return (
                  <div
                    key={teacher.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTeacher(teacher.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {teacher.profile_image && (
                              <Image
                                src={teacher.profile_image}
                                alt={teacher.full_name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{teacher.full_name}</h4>
                                {getStatusIcon(teacher.status)}
                              </div>
                              <p className="text-sm text-gray-600">{teacher.email}</p>
                              {teacher.subjects && teacher.subjects.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Subjects: {teacher.subjects.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          {teacher.experience_years && (
                            <span className="text-xs text-gray-500">
                              {teacher.experience_years} years exp.
                            </span>
                          )}
                        </div>

                        {/* Permissions */}
                        {isSelected && assignment && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={assignment.is_primary_teacher}
                                  onCheckedChange={(checked) =>
                                    updateTeacherPermission(teacher.id, 'is_primary_teacher', checked as boolean)
                                  }
                                />
                                <label className="text-sm font-medium text-gray-700">
                                  Primary Teacher
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={assignment.can_manage_content}
                                  onCheckedChange={(checked) =>
                                    updateTeacherPermission(teacher.id, 'can_manage_content', checked as boolean)
                                  }
                                />
                                <label className="text-sm text-gray-700">
                                  Manage Content
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={assignment.can_grade}
                                  onCheckedChange={(checked) =>
                                    updateTeacherPermission(teacher.id, 'can_grade', checked as boolean)
                                  }
                                />
                                <label className="text-sm text-gray-700">
                                  Grade Assignments
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={assignment.can_communicate}
                                  onCheckedChange={(checked) =>
                                    updateTeacherPermission(teacher.id, 'can_communicate', checked as boolean)
                                  }
                                />
                                <label className="text-sm text-gray-700">
                                  Communicate
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssignTeachers}
          disabled={selectedTeachers.size === 0 || saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Assigning...' : `Assign ${selectedTeachers.size} Teacher(s)`}
        </Button>
      </div>
    </div>
  )
}
