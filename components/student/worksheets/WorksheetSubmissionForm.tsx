'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Worksheet } from '@/types/materials'

interface WorksheetSubmissionFormProps {
  worksheet: Omit<Worksheet, 'answer_key_url' | 'answer_key_file_type'>
  existingSubmission?: {
    id: string
    status: string
    teacher_feedback?: string
  } | null
  onClose: () => void
  onSuccess: () => void
}

export function WorksheetSubmissionForm({
  worksheet,
  existingSubmission,
  onClose,
  onSuccess
}: WorksheetSubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [studentNotes, setStudentNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      setError('')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${worksheet.id}-${Date.now()}.${fileExt}`
      const filePath = `worksheet-submissions/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath)

      // Submit to API
      const response = await fetch(
        `/api/student/courses/${worksheet.course_id}/worksheets/${worksheet.id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submission_file_url: publicUrl,
            submission_file_type: file.type,
            submission_file_size: file.size,
            student_notes: studentNotes
          })
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit worksheet')
      }

      onSuccess()
    } catch (err) {
      console.error('Error submitting worksheet:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit worksheet')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingSubmission?.status === 'resubmit' ? 'Resubmit' : 'Submit'} Worksheet
          </DialogTitle>
          <DialogDescription>
            Upload your completed worksheet for {worksheet.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {existingSubmission?.teacher_feedback && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  Teacher Feedback:
                </p>
                <p className="text-sm text-yellow-800">
                  {existingSubmission.teacher_feedback}
                </p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <Label htmlFor="file">Upload File *</Label>
              <div className="mt-2">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label
                  htmlFor="file"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {file ? (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, PNG, JPG (max 50MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Student Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Add any notes or comments for your teacher..."
                rows={4}
                className="mt-2"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
