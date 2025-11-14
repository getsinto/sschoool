'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Calendar,
  Clock,
  Eye,
  DollarSign,
  User,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  teacherId: string
  price: number
  status: 'draft' | 'published' | 'archived'
  curriculum?: {
    sections: Array<{
      lessons: Array<any>
    }>
  }
}

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  course: Course
  onPublish: (scheduleDate?: Date) => Promise<void>
  onUnpublish?: () => Promise<void>
}

interface ValidationItem {
  label: string
  isValid: boolean
  icon: React.ReactNode
  message: string
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  course, 
  onPublish,
  onUnpublish 
}: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [schedulePublish, setSchedulePublish] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const isCurrentlyPublished = course.status === 'published'

  // Validation checks
  const validationItems: ValidationItem[] = [
    {
      label: 'Course Title',
      isValid: !!course.title && course.title.length >= 10,
      icon: <BookOpen className="w-4 h-4" />,
      message: course.title ? 'Title is set' : 'Title is required (min 10 characters)'
    },
    {
      label: 'Course Description',
      isValid: !!course.description && course.description.length >= 50,
      icon: <Eye className="w-4 h-4" />,
      message: course.description ? 'Description is set' : 'Description is required (min 50 characters)'
    },
    {
      label: 'Course Thumbnail',
      isValid: !!course.thumbnail,
      icon: <ImageIcon className="w-4 h-4" />,
      message: course.thumbnail ? 'Thumbnail uploaded' : 'Thumbnail is required'
    },
    {
      label: 'Teacher Assigned',
      isValid: !!course.teacherId,
      icon: <User className="w-4 h-4" />,
      message: course.teacherId ? 'Teacher is assigned' : 'Teacher must be assigned'
    },
    {
      label: 'Price Set',
      isValid: course.price > 0,
      icon: <DollarSign className="w-4 h-4" />,
      message: course.price > 0 ? `Price: $${course.price}` : 'Price must be set'
    },
    {
      label: 'Course Content',
      isValid: !!course.curriculum && course.curriculum.sections.length > 0 && 
               course.curriculum.sections.some(s => s.lessons.length > 0),
      icon: <BookOpen className="w-4 h-4" />,
      message: course.curriculum?.sections.length ? 
        `${course.curriculum.sections.length} sections, ${course.curriculum.sections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons` : 
        'At least one section with lessons is required'
    }
  ]

  const allValid = validationItems.every(item => item.isValid)
  const validCount = validationItems.filter(item => item.isValid).length
  const totalCount = validationItems.length

  const handlePublish = async () => {
    if (!allValid && !isCurrentlyPublished) {
      return
    }

    setIsPublishing(true)
    try {
      let publishDate: Date | undefined

      if (schedulePublish && scheduleDate && scheduleTime) {
        publishDate = new Date(`${scheduleDate}T${scheduleTime}`)
      }

      await onPublish(publishDate)
      onClose()
    } catch (error) {
      console.error('Error publishing course:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!onUnpublish) return

    setIsPublishing(true)
    try {
      await onUnpublish()
      onClose()
    } catch (error) {
      console.error('Error unpublishing course:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isCurrentlyPublished ? (
              <>
                <Globe className="w-5 h-5 text-green-600" />
                <span>Unpublish Course</span>
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Publish Course</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyPublished ? (
              'This course is currently published and visible to students. Unpublishing will hide it from the course catalog.'
            ) : (
              'Review the checklist below before publishing your course. All items must be completed.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Validation Progress */}
          {!isCurrentlyPublished && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion Progress
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {validCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    allValid ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${(validCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Validation Checklist */}
          {!isCurrentlyPublished && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Pre-publish Checklist</h4>
              {validationItems.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    item.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className={`mt-0.5 ${item.isValid ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.isValid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={item.isValid ? 'text-green-600' : 'text-orange-600'}>
                        {item.icon}
                      </span>
                      <h5 className={`font-medium ${
                        item.isValid ? 'text-green-900' : 'text-orange-900'
                      }`}>
                        {item.label}
                      </h5>
                    </div>
                    <p className={`text-sm mt-1 ${
                      item.isValid ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Publishing */}
          {!isCurrentlyPublished && allValid && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={schedulePublish}
                  onCheckedChange={(checked) => setSchedulePublish(checked as boolean)}
                />
                <Label htmlFor="schedule" className="flex items-center space-x-2 cursor-pointer">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule for later</span>
                </Label>
              </div>

              {schedulePublish && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="date" className="text-sm">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {schedulePublish && scheduleDate && scheduleTime && (
                <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Will be published on {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for Unpublish */}
          {isCurrentlyPublished && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-1">Warning</h4>
                  <p className="text-sm text-orange-700">
                    Unpublishing this course will:
                  </p>
                  <ul className="list-disc list-inside text-sm text-orange-700 mt-2 space-y-1">
                    <li>Hide the course from the course catalog</li>
                    <li>Prevent new student enrollments</li>
                    <li>Keep existing enrollments active</li>
                    <li>Maintain all course data and progress</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {!isCurrentlyPublished && !allValid && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Cannot Publish Yet</h4>
                  <p className="text-sm text-red-700">
                    Please complete all required items in the checklist above before publishing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!isCurrentlyPublished && allValid && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Ready to Publish!</h4>
                  <p className="text-sm text-green-700">
                    Your course meets all requirements and is ready to be published.
                    {schedulePublish && scheduleDate && scheduleTime ? (
                      <> It will be automatically published at the scheduled time.</>
                    ) : (
                      <> Students will be able to enroll immediately after publishing.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          {isCurrentlyPublished ? (
            <Button 
              variant="destructive"
              onClick={handleUnpublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Unpublishing...' : 'Unpublish Course'}
            </Button>
          ) : (
            <Button 
              onClick={handlePublish}
              disabled={!allValid || isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                'Publishing...'
              ) : schedulePublish && scheduleDate && scheduleTime ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Publish
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
