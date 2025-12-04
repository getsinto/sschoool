'use client'

import { useState, useEffect } from 'react'
import { Check, Play, Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { validateVideoFile, formatFileSize, formatDuration } from '@/lib/media/optimize'
import { uploadFile } from '@/lib/media/upload'

interface Lesson {
  id: string
  title: string
  duration?: number
  video_url?: string
  section_name?: string
}

interface DemoLessonSelectorProps {
  courseId: string
  existingDemos?: string[] // Array of lesson IDs marked as demos
  onUpdate?: (demoLessonIds: string[]) => void
}

export function DemoLessonSelector({
  courseId,
  existingDemos = [],
  onUpdate
}: DemoLessonSelectorProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedDemos, setSelectedDemos] = useState<Set<string>>(new Set(existingDemos))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadLessons()
  }, [courseId])

  const loadLessons = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons || [])
      }
    } catch (error) {
      console.error('Failed to load lessons:', error)
      setError('Failed to load lessons')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDemo = (lessonId: string) => {
    const newSelected = new Set(selectedDemos)
    
    if (newSelected.has(lessonId)) {
      newSelected.delete(lessonId)
    } else {
      // Limit to 3 demos
      if (newSelected.size >= 3) {
        setError('Maximum 3 demo lessons allowed')
        return
      }
      newSelected.add(lessonId)
    }
    
    setSelectedDemos(newSelected)
    setError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`/api/courses/${courseId}/demos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_lesson_ids: Array.from(selectedDemos)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save demo lessons')
      }

      setSuccess(true)
      if (onUpdate) {
        onUpdate(Array.from(selectedDemos))
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    const validation = validateVideoFile(file, {
      maxSize: 50 * 1024 * 1024 // 50MB for demos
    })

    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploadingFile(file)
    setError(null)

    try {
      // Upload video
      const result = await uploadFile({
        bucket: 'courses',
        path: `courses/${courseId}/demos/demo-${Date.now()}.${file.name.split('.').pop()}`,
        file,
        onProgress: (progress) => setUploadProgress(progress)
      })

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add to gallery as demo video
      const response = await fetch(`/api/courses/${courseId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'demo_video',
          media_url: result.url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          is_free_preview: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save demo video')
      }

      setSuccess(true)
      setUploadingFile(null)
      setUploadProgress(0)
      
      // Reload lessons to include new demo
      await loadLessons()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploadingFile(null)
      setUploadProgress(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="w-5 h-5 mr-2" />
          Demo Lessons (Free Preview)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select up to 3 lessons as free previews for potential students
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Standalone Demo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Upload Standalone Demo</Label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
              id="demo-upload"
              disabled={uploadingFile !== null}
            />
            <label htmlFor="demo-upload">
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingFile !== null}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Upload a video that's not part of the course curriculum (max 50MB)
          </p>

          {uploadingFile && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{uploadingFile.name}</span>
                <span className="text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        {/* Select from Existing Lessons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Or Select from Course Lessons
          </Label>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading lessons...
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No lessons available. Add lessons to your course first.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lessons.map((lesson) => {
                const isSelected = selectedDemos.has(lesson.id)
                const hasVideo = !!lesson.video_url

                return (
                  <div
                    key={lesson.id}
                    className={`border rounded-lg p-3 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${!hasVideo ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDemo(lesson.id)}
                        disabled={!hasVideo || (selectedDemos.size >= 3 && !isSelected)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {lesson.title}
                          </h4>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        {lesson.section_name && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {lesson.section_name}
                          </p>
                        )}
                        {lesson.duration && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Duration: {formatDuration(lesson.duration)}
                          </p>
                        )}
                        {!hasVideo && (
                          <p className="text-xs text-red-600 mt-1">
                            No video available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Selection Counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedDemos.size} of 3 demos selected
            </span>
            {selectedDemos.size >= 3 && (
              <span className="text-orange-600 text-xs">
                Maximum reached
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">Demo lessons saved successfully!</p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || selectedDemos.size === 0}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Demo Lessons'}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Demo lessons are free previews that help students decide if they want to enroll. Choose your best content!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
