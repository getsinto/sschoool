'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { WorksheetSubmissionForm } from './WorksheetSubmissionForm'
import type { Worksheet } from '@/types/materials'

interface WorksheetCardProps {
  worksheet: Omit<Worksheet, 'answer_key_url' | 'answer_key_file_type'> & {
    my_submission?: {
      id: string
      status: 'pending' | 'graded' | 'resubmit'
      grade?: number
      submitted_at: string
      graded_at?: string
      teacher_feedback?: string
    } | null
  }
  onSubmit: () => void
}

export function WorksheetCard({ worksheet, onSubmit }: WorksheetCardProps) {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const submission = worksheet.my_submission

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = () => {
    if (!submission) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Not Submitted
        </Badge>
      )
    }

    switch (submission.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'graded':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Graded: {submission.grade}/{worksheet.max_grade}
          </Badge>
        )
      case 'resubmit':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Resubmit Required
          </Badge>
        )
    }
  }

  const handleDownload = () => {
    window.open(worksheet.worksheet_file_url, '_blank')
  }

  const handleSubmit = () => {
    setShowSubmissionForm(true)
  }

  const handleSubmissionComplete = () => {
    setShowSubmissionForm(false)
    onSubmit()
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            {getStatusBadge()}
          </div>
          <CardTitle className="text-lg">{worksheet.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {worksheet.description && (
            <p className="text-sm text-gray-600 mb-4">{worksheet.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Difficulty:</span>
              <Badge className={getDifficultyColor(worksheet.difficulty_level)}>
                {worksheet.difficulty_level}
              </Badge>
            </div>

            {worksheet.estimated_minutes && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Est. Time:</span>
                <span className="font-medium">{worksheet.estimated_minutes} min</span>
              </div>
            )}

            {worksheet.requires_submission && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Max Grade:</span>
                <span className="font-medium">{worksheet.max_grade} points</span>
              </div>
            )}
          </div>

          {worksheet.tags && worksheet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {worksheet.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {submission?.teacher_feedback && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">Teacher Feedback:</p>
              <p className="text-sm text-blue-800">{submission.teacher_feedback}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {worksheet.download_allowed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}

          {worksheet.requires_submission && (
            <>
              {!submission || submission.status === 'resubmit' ? (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {submission?.status === 'resubmit' ? 'Resubmit' : 'Submit'}
                </Button>
              ) : submission.status === 'graded' && submission.teacher_feedback ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="flex-1"
                >
                  {showFeedback ? 'Hide' : 'View'} Feedback
                </Button>
              ) : null}
            </>
          )}
        </CardFooter>
      </Card>

      {showSubmissionForm && (
        <WorksheetSubmissionForm
          worksheet={worksheet}
          existingSubmission={submission}
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={handleSubmissionComplete}
        />
      )}
    </>
  )
}
