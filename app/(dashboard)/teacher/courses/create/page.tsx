'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepProgress } from '@/components/teacher/course-builder/StepProgress'
import { BasicInfoForm } from '@/components/teacher/course-builder/BasicInfoForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Basic Information', description: 'Course details and overview' },
  { id: 2, name: 'Curriculum', description: 'Add sections and lessons' },
  { id: 3, name: 'Organization', description: 'Arrange course structure' },
  { id: 4, name: 'Pricing', description: 'Set pricing and enrollment' },
  { id: 5, name: 'Review', description: 'Review and publish' }
]

export default function CreateCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(courseData).length > 0) {
        saveDraft()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSave)
  }, [courseData])

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('course_draft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setCourseData(parsedDraft)
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [])

  const saveDraft = async () => {
    try {
      localStorage.setItem('course_draft', JSON.stringify(courseData))
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
    router.push('/dashboard/teacher/courses')
  }

  const updateCourseData = (data: any) => {
    setCourseData({ ...courseData, ...data })
  }

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
          <div className="text-center py-12">
            <p className="text-gray-600">Curriculum builder will be implemented here</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Drag-drop organization will be implemented here</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Pricing form will be implemented here</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Course preview will be implemented here</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button>
                Publish Course
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.name || ''}
          </p>
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
    </div>
  )
}
