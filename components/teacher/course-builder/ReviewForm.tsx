'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, BookOpen, DollarSign, Users, Calendar } from 'lucide-react'

interface ReviewFormProps {
  data: any
  onPrevious: () => void
}

export function ReviewForm({ data, onPrevious }: ReviewFormProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const sections = data.sections || []
  const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0)

  const isComplete = {
    basicInfo: !!(data.title && data.description && data.category),
    curriculum: sections.length > 0 && totalLessons > 0,
    pricing: data.pricingType !== undefined
  }

  const allComplete = Object.values(isComplete).every(v => v)

  const handlePublish = async () => {
    if (!allComplete) return

    setIsPublishing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear draft
      localStorage.removeItem('course_draft')
      
      // Redirect to courses page
      router.push('/dashboard/teacher/courses')
    } catch (error) {
      console.error('Failed to publish course:', error)
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = () => {
    router.push('/dashboard/teacher/courses')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
        <p className="text-gray-600">Review your course details before publishing</p>
      </div>

      {/* Completion Status */}
      <Card className={allComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {allComplete ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Ready to Publish!</h3>
                  <p className="text-sm text-green-700">All required sections are complete</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Almost There!</h3>
                  <p className="text-sm text-yellow-700">Complete all sections to publish your course</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Basic Information
            </CardTitle>
            {isComplete.basicInfo ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-medium">{data.title || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-700">{data.description || 'Not set'}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <Badge variant="outline">{data.category || 'Not set'}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Grade Level</p>
              <Badge variant="outline">{data.gradeLevel || 'Not set'}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <Badge variant="outline">{data.subject || 'Not set'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Curriculum
            </CardTitle>
            {isComplete.curriculum ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          <CardDescription>
            {sections.length} section{sections.length !== 1 ? 's' : ''} • {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-gray-500">No curriculum added</p>
          ) : (
            <div className="space-y-2">
              {sections.map((section: any, index: number) => (
                <div key={section.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{section.title || `Section ${index + 1}`}</span>
                  <span className="text-gray-500">
                    ({section.lessons?.length || 0} lesson{section.lessons?.length !== 1 ? 's' : ''})
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Enrollment
            </CardTitle>
            {isComplete.pricing ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Pricing Model</p>
            <p className="font-medium capitalize">{data.pricingType || 'Not set'}</p>
          </div>
          {data.pricingType === 'paid' && (
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-green-600">${data.price || '0.00'}</p>
            </div>
          )}
          {data.enableEnrollmentLimit && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Max {data.enrollmentLimit} students</span>
            </div>
          )}
          {data.enableDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Enrollment deadline: {data.enrollmentDeadline}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!allComplete || isPublishing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish Course'}
          </Button>
        </div>
      </div>
    </div>
  )
}
