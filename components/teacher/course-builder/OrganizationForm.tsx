'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, GripVertical } from 'lucide-react'

interface OrganizationFormProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function OrganizationForm({ data, onUpdate, onNext, onPrevious }: OrganizationFormProps) {
  const sections = data.sections || []

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Organization</h2>
        <p className="text-gray-600">Review and organize your course structure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Structure Preview</CardTitle>
          <CardDescription>
            Your course has {sections.length} section{sections.length !== 1 ? 's' : ''} with{' '}
            {sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0)} total lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sections added yet. Go back to add curriculum content.</p>
            </div>
          ) : (
            sections.map((section: any, index: number) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Section {index + 1}: {section.title || 'Untitled Section'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.lessons?.length || 0} lesson{section.lessons?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-8 space-y-2">
                  {section.lessons?.map((lesson: any, lessonIndex: number) => (
                    <div key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>
                        {lessonIndex + 1}. {lesson.title || 'Untitled Lesson'} ({lesson.type})
                      </span>
                      {lesson.duration && (
                        <span className="text-gray-400">• {lesson.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>✓ Organize content from basic to advanced concepts</p>
          <p>✓ Group related lessons into logical sections</p>
          <p>✓ Include a mix of content types (videos, readings, quizzes)</p>
          <p>✓ Add assessments after each major section</p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
