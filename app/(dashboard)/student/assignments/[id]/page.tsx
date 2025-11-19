'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, BookOpen, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AssignmentSubmission from '@/components/student/learning/AssignmentSubmission'
import SubmissionHistory from '@/components/student/assignments/SubmissionHistory'

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignmentDetails()
  }, [assignmentId])

  const loadAssignmentDetails = async () => {
    try {
      setLoading(true)
      
      const assignmentResponse = await fetch(`/api/student/assignments/${assignmentId}`)
      const assignmentData = await assignmentResponse.json()
      
      if (assignmentData.success) {
        setAssignment(assignmentData.data)
      }

      const submissionsResponse = await fetch(`/api/student/assignments/${assignmentId}/submissions`)
      const submissionsData = await submissionsResponse.json()
      
      if (submissionsData.success) {
        setSubmissions(submissionsData.data)
      }
    } catch (error) {
      console.error('Failed to load assignment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    loadAssignmentDetails()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Assignment not found</p>
          <Button onClick={() => router.push('/student/assignments')} className="mt-4">
            Back to Assignments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/assignments')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-xl font-bold">{assignment.title}</h1>
            <p className="text-sm text-gray-600">{assignment.courseName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AssignmentSubmission
              assignment={assignment}
              lessonId={assignmentId}
              onComplete={handleComplete}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Course</p>
                  <p className="text-sm">{assignment.courseName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Instructor</p>
                  <p className="text-sm">{assignment.instructor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Due Date</p>
                    <p className="text-sm">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Time Remaining</p>
                    <p className="text-sm">
                      {Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {submissions.length > 0 && (
              <SubmissionHistory submissions={submissions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
