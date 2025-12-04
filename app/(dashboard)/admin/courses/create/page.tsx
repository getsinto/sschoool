'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepProgress } from '@/components/teacher/course-builder/StepProgress'
import { BasicInfoForm } from '@/components/teacher/course-builder/BasicInfoForm'
import { CurriculumForm } from '@/components/teacher/course-builder/CurriculumForm'
import { OrganizationForm } from '@/components/teacher/course-builder/OrganizationForm'
import { PricingForm } from '@/components/teacher/course-builder/PricingForm'
import { MediaManager } from '@/components/teacher/course-builder/MediaManager'
import { ReviewForm } from '@/components/teacher/course-builder/ReviewForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Basic Information', description: 'Course details and overview' },
  { id: 2, name: 'Curriculum', description: 'Add sections and lessons' },
  { id: 3, name: 'Organization', description: 'Arrange course structure' },
  { id: 4, name: 'Pricing', description: 'Set pricing and enrollment' },
  { id: 5, name: 'Review', description: 'Review and publish' }
]

interface Teacher {
  id: string
  full_name: string
  email: string
  subjects?: string[]
  experience_years?: number
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
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showTeacherAssignment, setShowTeacherAssignment] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<Map<string, TeacherAssignment>>(new Map())
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(courseData).length > 0) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(autoSave)
  }, [courseData])

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('admin_course_draft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setCourseData(parsedDraft)
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [])

  // Load teachers for assignment
  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/admin/courses/create?include_teachers=true')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.data.teachers || [])
      }
    } catch (error) {
      console.error('Failed to load teachers:', error)
    }
  }

  const saveDraft = async () => {
    try {
      localStorage.setItem('admin_course_draft', JSON.stringify(courseData))
      console.log('Draft saved')
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveAndExit = async () => {
    setIsSaving(true)
    await saveDraft()
    setIsSaving(false)
    router.push('/admin/courses')
  }

  const updateCourseData = (data: any) => {
    setCourseData({ ...courseData, ...data })
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
        is_primary_teacher: newSelected.size === 0
      })
    }
    setSelectedTeachers(newSelected)
  }

  const updateTeacherPermission = (teacherId: string, permission: keyof Omit<TeacherAssignment, 'teacher_id'>, value: boolean) => {
    const newSelected = new Map(selectedTeachers)
    const assignment = newSelected.get(teacherId)
    if (assignment) {
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

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.subjects?.some(subject => subject.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            data={courseData}
            onUpdate={updateCourseData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <CurriculumForm
            data={courseData}
            onUpdate={updateCourseData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 3:
        return (
          <OrganizationForm
            data={courseData}
            onUpdate={updateCourseData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 4:
        return (
          <PricingForm
            data={courseData}
            onUpdate={updateCourseData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 5:
        return (
          <ReviewForm
            data={courseData}
            onPrevious={handlePrevious}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.name || ''}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleSaveAndExit}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save & Exit'}
        </Button>
      </div>

      {/* Step Progress */}
      <StepProgress steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStepContent()}
      </div>

      {/* Teacher Assignment Section - Show after basic info */}
      {currentStep >= 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Assign Teachers (Optional)
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Assign teachers to manage this course. You can also do this later.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTeacherAssignment(!showTeacherAssignment)}
              >
                {showTeacherAssignment ? 'Hide' : 'Show'} Teachers
              </Button>
            </div>
          </CardHeader>
          {showTeacherAssignment && (
            <CardContent className="space-y-4">
              {teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No teachers available</div>
              ) : (
                <>
                  {teachers.length > 5 && (
                    <Input
                      placeholder="Search teachers..."
                      value={teacherSearchTerm}
                      onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    />
                  )}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredTeachers.map((teacher) => {
                      const isSelected = selectedTeachers.has(teacher.id)
                      const assignment = selectedTeachers.get(teacher.id)

                      return (
                        <div
                          key={teacher.id}
                          className={`border rounded-lg p-4 ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleTeacher(teacher.id)}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{teacher.full_name}</h4>
                              <p className="text-sm text-gray-600">{teacher.email}</p>
                              {isSelected && assignment && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={assignment.is_primary_teacher}
                                      onCheckedChange={(checked) =>
                                        updateTeacherPermission(teacher.id, 'is_primary_teacher', checked as boolean)
                                      }
                                    />
                                    <label className="text-sm">Primary Teacher</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={assignment.can_manage_content}
                                      onCheckedChange={(checked) =>
                                        updateTeacherPermission(teacher.id, 'can_manage_content', checked as boolean)
                                      }
                                    />
                                    <label className="text-sm">Can manage content</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={assignment.can_grade}
                                      onCheckedChange={(checked) =>
                                        updateTeacherPermission(teacher.id, 'can_grade', checked as boolean)
                                      }
                                    />
                                    <label className="text-sm">Can grade</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={assignment.can_communicate}
                                      onCheckedChange={(checked) =>
                                        updateTeacherPermission(teacher.id, 'can_communicate', checked as boolean)
                                      }
                                    />
                                    <label className="text-sm">Can communicate</label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {selectedTeachers.size > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedTeachers.size}</strong> teacher(s) selected
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
