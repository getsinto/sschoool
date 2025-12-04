'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Download, 
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  RotateCcw
} from 'lucide-react'
import { Worksheet, WorksheetSubmission } from '@/types/materials'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WorksheetGradingProps {
  worksheet: Worksheet
  submission: WorksheetSubmission
  onClose: () => void
}

export function WorksheetGrading({ worksheet, submission, onClose }: WorksheetGradingProps) {
  const [grade, setGrade] = useState<number>(submission.grade || 0)
  const [feedback, setFeedback] = useState(submission.teacher_feedback || '')
  const [requestResubmit, setRequestResubmit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    // Validation
    if (grade < 0 || grade > submission.max_grade) {
      setError(`Grade must be between 0 and ${submission.max_grade}`)
      return
    }

    if (requestResubmit && !feedback.trim()) {
      setError('Feedback is required when requesting resubmission')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch(
        `/api/teacher/courses/${worksheet.course_id}/worksheets/${worksheet.id}/submissions/${submission.id}/grade`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade,
            feedback,
            status: requestResubmit ? 'resubmit_requested' : 'graded'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save grade')
      }

      onClose()
    } catch (error) {
      console.error('Error saving grade:', error)
      setError('Failed to save grade. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const gradePercentage = ((grade / submission.max_grade) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Grade Submission</h2>
          <p className="text-gray-600">{worksheet.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Student</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{submission.student_id}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Submitted</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatDate(submission.submitted_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {submission.is_late && (
                  <Badge variant="destructive">Late Submission</Badge>
                )}
                {submission.resubmission_count > 0 && (
                  <Badge variant="outline">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Resubmission #{submission.resubmission_count}
                  </Badge>
                )}
                {submission.status === 'graded' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Previously Graded
                  </Badge>
                )}
              </div>

              {submission.submission_notes && (
                <div>
                  <Label className="text-gray-600">Student Notes</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">
                    {submission.submission_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submitted File */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Work</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.submission_file_url ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Student Submission</p>
                      <p className="text-sm text-blue-700">
                        {submission.submission_file_type || 'PDF Document'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(submission.submission_file_url!, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = submission.submission_file_url!
                          link.download = `submission-${submission.id}.pdf`
                          link.click()
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Answer Key */}
                  {worksheet.answer_key_url && (
                    <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Answer Key</p>
                        <p className="text-sm text-green-700">Reference for grading</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(worksheet.answer_key_url!, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No file submitted</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          {submission.status === 'graded' && submission.teacher_feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      Graded on {submission.graded_at ? formatDate(submission.graded_at) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{submission.teacher_feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Grading Form */}
        <div className="space-y-6">
          {/* Grade Input */}
          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  Points <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(parseFloat(e.target.value) || 0)}
                    min="0"
                    max={submission.max_grade}
                    step="0.5"
                    className="text-lg font-bold"
                  />
                  <span className="text-gray-600">/ {submission.max_grade}</span>
                </div>
              </div>

              {/* Grade Percentage */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-3xl font-bold text-blue-600">{gradePercentage}%</p>
              </div>

              {/* Quick Grade Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade)}
                >
                  100%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade * 0.9)}
                >
                  90%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade * 0.8)}
                >
                  80%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade * 0.7)}
                >
                  70%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade * 0.6)}
                >
                  60%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGrade(submission.max_grade * 0.5)}
                >
                  50%
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Comments for Student</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  rows={8}
                  className="mt-1"
                />
              </div>

              {/* Request Resubmission */}
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="resubmit"
                  checked={requestResubmit}
                  onChange={(e) => setRequestResubmit(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="resubmit" className="cursor-pointer flex-1">
                  <span className="font-medium">Request Resubmission</span>
                  <p className="text-xs text-gray-600 mt-1">
                    Student will be asked to resubmit their work
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {requestResubmit ? 'Save & Request Resubmission' : 'Save Grade'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
