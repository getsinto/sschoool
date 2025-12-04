/**
 * Teacher Assignment Component
 * Feature: course-assignment-permissions
 * 
 * Allows admins to search, filter, and select teachers for course assignment
 * Requirements: 7.3, 7.4, 12.1, 12.2, 12.3
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Filter, 
  User, 
  BookOpen, 
  Award,
  Crown,
  CheckCircle,
  X
} from 'lucide-react'
import Image from 'next/image'

interface Teacher {
  id: string
  user_id: string
  full_name: string
  email: string
  profile_image_url?: string
  teacher_type: 'senior_teacher' | 'course_teacher' | 'tuition_teacher'
  subjects: string[]
  years_of_experience?: number
  bio?: string
  is_verified: boolean
}

interface TeacherPermissions {
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
}

interface SelectedTeacher extends Teacher {
  permissions: TeacherPermissions
  is_primary: boolean
}

interface TeacherAssignmentProps {
  courseId?: string
  onAssign: (teachers: SelectedTeacher[]) => void
  existingAssignments?: string[] // Array of teacher IDs already assigned
}

export default function TeacherAssignment({ 
  courseId, 
  onAssign,
  existingAssignments = []
}: TeacherAssignmentProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<Map<string, SelectedTeacher>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    loadTeachers()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [searchTerm, typeFilter, subjectFilter, teachers])

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers || [])
        
        // Extract unique subjects
        const uniqueSubjects = Array.from(
          new Set(data.teachers.flatMap((t: Teacher) => t.subjects || []))
        ) as string[]
        setSubjects(uniqueSubjects)
      }
    } catch (error) {
      console.error('Failed to load teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTeachers = () => {
    let filtered = teachers.filter(teacher => 
      !existingAssignments.includes(teacher.id)
    )

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.teacher_type === typeFilter)
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(teacher => 
        teacher.subjects?.includes(subjectFilter)
      )
    }

    setFilteredTeachers(filtered)
  }

  const toggleTeacherSelection = (teacher: Teacher) => {
    const newSelected = new Map(selectedTeachers)
    
    if (newSelected.has(teacher.id)) {
      newSelected.delete(teacher.id)
    } else {
      newSelected.set(teacher.id, {
        ...teacher,
        permissions: {
          can_manage_content: true,
          can_grade: true,
          can_communicate: true
        },
        is_primary: newSelected.size === 0 // First teacher is primary by default
      })
    }
    
    setSelectedTeachers(newSelected)
  }

  const updatePermissions = (teacherId: string, permission: keyof TeacherPermissions) => {
    const newSelected = new Map(selectedTeachers)
    const teacher = newSelected.get(teacherId)
    
    if (teacher) {
      teacher.permissions[permission] = !teacher.permissions[permission]
      newSelected.set(teacherId, teacher)
      setSelectedTeachers(newSelected)
    }
  }

  const setPrimaryTeacher = (teacherId: string) => {
    const newSelected = new Map(selectedTeachers)
    
    // Remove primary from all teachers
    newSelected.forEach((teacher, id) => {
      teacher.is_primary = id === teacherId
    })
    
    setSelectedTeachers(newSelected)
  }

  const handleAssign = () => {
    const teachersArray = Array.from(selectedTeachers.values())
    onAssign(teachersArray)
  }

  const getTeacherTypeLabel = (type: string) => {
    switch (type) {
      case 'senior_teacher':
        return 'Senior Teacher'
      case 'course_teacher':
        return 'Course Teacher'
      case 'tuition_teacher':
        return 'Tuition Teacher'
      default:
        return type
    }
  }

  const getTeacherTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'senior_teacher':
        return 'bg-purple-100 text-purple-800'
      case 'course_teacher':
        return 'bg-blue-100 text-blue-800'
      case 'tuition_teacher':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading teachers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Teachers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label>Filters:</Label>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="senior_teacher">Senior Teacher</option>
              <option value="course_teacher">Course Teacher</option>
              <option value="tuition_teacher">Tuition Teacher</option>
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {(searchTerm || typeFilter !== 'all' || subjectFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('all')
                  setSubjectFilter('all')
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Teachers Summary */}
      {selectedTeachers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center justify-between">
              <span>Selected Teachers ({selectedTeachers.size})</span>
              <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700">
                Assign Teachers
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(selectedTeachers.values()).map(teacher => (
                <div key={teacher.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {teacher.profile_image_url ? (
                        <Image
                          src={teacher.profile_image_url}
                          alt={teacher.full_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{teacher.full_name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                      {teacher.is_primary && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTeacherSelection(teacher)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-4">
                      <Label className="text-sm font-medium">Permissions:</Label>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={teacher.permissions.can_manage_content}
                            onCheckedChange={() => updatePermissions(teacher.id, 'can_manage_content')}
                          />
                          <span className="text-sm">Manage Content</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={teacher.permissions.can_grade}
                            onCheckedChange={() => updatePermissions(teacher.id, 'can_grade')}
                          />
                          <span className="text-sm">Grade Students</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={teacher.permissions.can_communicate}
                            onCheckedChange={() => updatePermissions(teacher.id, 'can_communicate')}
                          />
                          <span className="text-sm">Communicate</span>
                        </label>
                      </div>
                    </div>

                    {selectedTeachers.size > 1 && (
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">Primary Teacher:</Label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="primary_teacher"
                            checked={teacher.is_primary}
                            onChange={() => setPrimaryTeacher(teacher.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Set as primary</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>
            Available Teachers ({filteredTeachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {teachers.length === 0 ? 'No teachers available' : 'No teachers match your filters'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map(teacher => (
                <Card 
                  key={teacher.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTeachers.has(teacher.id) ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => toggleTeacherSelection(teacher)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedTeachers.has(teacher.id)}
                        onCheckedChange={() => toggleTeacherSelection(teacher)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {teacher.profile_image_url ? (
                            <Image
                              src={teacher.profile_image_url}
                              alt={teacher.full_name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{teacher.full_name}</div>
                            <div className="text-xs text-gray-500 truncate">{teacher.email}</div>
                          </div>
                          {teacher.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Badge className={getTeacherTypeBadgeColor(teacher.teacher_type)}>
                            {getTeacherTypeLabel(teacher.teacher_type)}
                          </Badge>

                          {teacher.years_of_experience && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Award className="w-3 h-3 mr-1" />
                              {teacher.years_of_experience} years experience
                            </div>
                          )}

                          {teacher.subjects && teacher.subjects.length > 0 && (
                            <div className="flex items-start text-xs text-gray-600">
                              <BookOpen className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {teacher.subjects.slice(0, 3).map(subject => (
                                  <span key={subject} className="bg-gray-100 px-2 py-0.5 rounded">
                                    {subject}
                                  </span>
                                ))}
                                {teacher.subjects.length > 3 && (
                                  <span className="text-gray-500">+{teacher.subjects.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          {teacher.bio && (
                            <p className="text-xs text-gray-600 line-clamp-2">{teacher.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
