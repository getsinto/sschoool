'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, UserPlus, X } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
  email: string
  subjects?: string[]
  experience_years?: number
  profile_image?: string
}

interface Subject {
  id: string
  name: string
  description?: string
  category?: string
}

interface TeacherAssignment {
  teacher_id: string
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  is_primary_teacher: boolean
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [gradeLevels, setGradeLevels] = useState<string[]>([])
  const [loadingFormData, setLoadingFormData] = useState(false)
  const [selectedTeachers, setSelectedTeachers] = useState<Map<string, TeacherAssignment>>(new Map())
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    grade_level: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: '',
    duration_weeks: '',
    max_students: '',
    thumbnail_url: ''
  })

  // Load form data on mount
  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    setLoadingFormData(true)
    try {
      const response = await fetch('/api/admin/courses/create')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.data.teachers || [])
        setSubjects(data.data.subjects || [])
        setGradeLevels(data.data.grade_levels || [])
      }
    } catch (error) {
      console.error('Failed to load form data:', error)
    } finally {
      setLoadingFormData(false)
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
        is_primary_teacher: newSelected.size === 0 // First teacher is primary by default
      })
    }
    setSelectedTeachers(newSelected)
  }

  const updateTeacherPermission = (teacherId: string, permission: keyof Omit<TeacherAssignment, 'teacher_id'>, value: boolean) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const assignments = Array.from(selectedTeachers.values())
      
      const payload = {
        title: formData.title,
        description: formData.description,
        subject_id: formData.subject_id,
        grade_level: formData.grade_level,
        level: formData.level,
        price: formData.price ? parseFloat(formData.price) : 0,
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : undefined,
        max_students: formData.max_students ? parseInt(formData.max_students) : undefined,
        thumbnail_url: formData.thumbnail_url || null,
        teacher_assignments: assignments
      }
      
      const response = await fetch('/api/admin/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create course')
      }

      // Show detailed success message
      let message = `Course "${result.course.title}" created successfully!`
      if (assignments.length > 0) {
        message += `\n${assignments.length} teacher(s) assigned.`
        if (result.assignment_errors && result.assignment_errors.length > 0) {
          message += `\n${result.assignment_errors.length} assignment(s) failed.`
        }
      }
      
      alert(message)
      router.push(`/admin/courses/${result.course.id}`)
    } catch (error: any) {
      console.error('Error creating course:', error)
      alert(error.message || 'Failed to create course. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.subjects?.some(subject => subject.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">Add a new course to your platform</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Mathematics Grade 10"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your course..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject_id">Subject *</Label>
                <select
                  id="subject_id"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={loadingFormData}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="grade_level">Grade Level *</Label>
                <select
                  id="grade_level"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={loadingFormData}
                >
                  <option value="">Select a grade level</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Course Level *</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                  placeholder="12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_students">Maximum Students (optional)</Label>
              <Input
                id="max_students"
                type="number"
                min="1"
                max="1000"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                placeholder="30"
              />
            </div>

          </CardContent>
        </Card>

        {/* Teacher Assignment Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Assign Teachers (Optional)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Select teachers to assign to this course. You can also assign teachers later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingFormData ? (
              <div className="text-center py-8 text-gray-500">Loading teachers...</div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No teachers available</div>
            ) : (
              <>
                {/* Search Bar */}
                {teachers.length > 5 && (
                  <div className="mb-4">
                    <Input
                      placeholder="Search teachers by name, email, or subject..."
                      value={teacherSearchTerm}
                      onChange={(e) => setTeacherSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No teachers found matching your search.
                    </div>
                  ) : (
                    filteredTeachers.map((teacher) => {
                  const isSelected = selectedTeachers.has(teacher.id)
                  const assignment = selectedTeachers.get(teacher.id)

                  return (
                    <div
                      key={teacher.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                            <div>
                              <h4 className="font-medium text-gray-900">{teacher.full_name}</h4>
                              <p className="text-sm text-gray-600">{teacher.email}</p>
                              {teacher.subjects && teacher.subjects.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Subjects: {teacher.subjects.join(', ')}
                                </p>
                              )}
                            </div>
                            {teacher.experience_years && (
                              <span className="text-xs text-gray-500">
                                {teacher.experience_years} years exp.
                              </span>
                            )}
                          </div>

                          {isSelected && assignment && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
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
                                  Can manage course content
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
                                  Can grade assignments
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
                                  Can communicate with students
                                </label>
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
              </>
            )}

            {selectedTeachers.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedTeachers.size}</strong> teacher(s) selected
                  {Array.from(selectedTeachers.values()).some(a => a.is_primary_teacher) && (
                    <span className="ml-2">
                      • Primary teacher assigned
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-3 pt-6">
          <Button type="submit" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Creating...' : 'Create Course'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
