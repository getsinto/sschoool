'use client'

import { useState, useEffect } from 'react'
import { Upload, X, FileText, Clock, CheckCircle, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AssignmentSubmissionProps {
  assignment: {
    id: string
    title: string
    description: string
    instructions: string
    dueDate: string
    maxPoints: number
    allowedFileTypes: string[]
    maxFileSize: number
    submissionType: 'file' | 'text' | 'both'
  }
  lessonId: string
  onComplete: () => void
}

export default function AssignmentSubmission({ assignment, lessonId, onComplete }: AssignmentSubmissionProps) {
  const [textSubmission, setTextSubmission] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [submission, setSubmission] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    loadSubmission()
    // Auto-save draft every 30 seconds
    const interval = setInterval(() => {
      if (textSubmission || files.length > 0) {
        saveDraft()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [assignment.id])

  const loadSubmission = async () => {
    try {
      const response = await fetch(`/api/student/assignments/${assignment.id}/submission`)
      const data = await response.json()
      if (data.success && data.data) {
        setSubmission(data.data)
        if (data.data.status === 'draft') {
          setTextSubmission(data.data.textContent || '')
          setIsDraft(true)
        }
      }
    } catch (error) {
      console.error('Failed to load submission:', error)
    }
  }

  const saveDraft = async () => {
    try {
      const formData = new FormData()
      formData.append('textContent', textSubmission)
      files.forEach(file => formData.append('files', file))

      await fetch(`/api/student/assignments/${assignment.id}/draft`, {
        method: 'POST',
        body: formData
      })
      setIsDraft(true)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      return assignment.allowedFileTypes.includes(extension)
    })

    // Validate file sizes
    const sizeValidFiles = validFiles.filter(file => 
      file.size <= assignment.maxFileSize * 1024 * 1024
    )

    setFiles([...files, ...sizeValidFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('textContent', textSubmission)
      formData.append('lessonId', lessonId)
      
      files.forEach(file => formData.append('files', file))

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/student/assignments/${assignment.id}/submit`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()
      if (data.success) {
        setSubmission(data.data)
        onComplete()
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOverdue = new Date(assignment.dueDate) < new Date()
  const canSubmit = (assignment.submissionType === 'text' && textSubmission.trim()) ||
                    (assignment.submissionType === 'file' && files.length > 0) ||
                    (assignment.submissionType === 'both' && (textSubmission.trim() || files.length > 0))

  // Show submission status if already submitted
  if (submission && submission.status === 'submitted') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Submitted</CardTitle>
            <Badge className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Submitted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              Your assignment has been submitted successfully!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Submitted on {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>

          {submission.grade && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                Grade: {submission.grade}/{assignment.maxPoints}
              </p>
              {submission.feedback && (
                <p className="text-sm text-blue-600 mt-2">{submission.feedback}</p>
              )}
            </div>
          )}

          {submission.textContent && (
            <div>
              <h4 className="font-semibold mb-2">Your Submission:</h4>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="whitespace-pre-wrap">{submission.textContent}</p>
              </div>
            </div>
          )}

          {submission.files && submission.files.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Submitted Files:</h4>
              <div className="space-y-2">
                {submission.files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.open(file.url, '_blank')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onComplete} className="w-full">
            Continue to Next Lesson
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{assignment.title}</CardTitle>
          <div className="flex items-center gap-2">
            {isDraft && (
              <Badge variant="secondary">
                Draft Saved
              </Badge>
            )}
            {isOverdue ? (
              <Badge variant="destructive">
                <AlertCircle className="w-4 h-4 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="w-4 h-4 mr-1" />
                Due {new Date(assignment.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{assignment.description}</p>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-semibold mb-2">Instructions</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Max Points</p>
            <p className="font-semibold">{assignment.maxPoints}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Text Submission */}
        {(assignment.submissionType === 'text' || assignment.submissionType === 'both') && (
          <div>
            <h3 className="font-semibold mb-2">Your Answer</h3>
            <Textarea
              placeholder="Type your answer here..."
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              rows={10}
              className="font-mono"
            />
          </div>
        )}

        {/* File Upload */}
        {(assignment.submissionType === 'file' || assignment.submissionType === 'both') && (
          <div>
            <h3 className="font-semibold mb-2">Upload Files</h3>
            <div className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Allowed: {assignment.allowedFileTypes.join(', ')} (Max {assignment.maxFileSize}MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept={assignment.allowedFileTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" type="button">
                    Select Files
                  </Button>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isSubmitting && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={saveDraft}
            variant="outline"
            disabled={isSubmitting || (!textSubmission && files.length === 0)}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>

        {isOverdue && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ This assignment is overdue. Late submissions may receive reduced points.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
