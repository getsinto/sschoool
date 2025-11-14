'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, Video, Users, Bell, Repeat } from 'lucide-react'

interface ClassSchedulerProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  isEditing?: boolean
}

export default function ClassScheduler({ onSubmit, initialData, isEditing = false }: ClassSchedulerProps) {
  const [formData, setFormData] = useState({
    courseId: initialData?.courseId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    duration: initialData?.duration || 60,
    platform: initialData?.platform || 'zoom',
    autoGenerateLink: initialData?.autoGenerateLink ?? true,
    sendNotifications: initialData?.sendNotifications ?? true,
    isRecurring: initialData?.isRecurring || false,
    recurringType: initialData?.recurringType || 'weekly',
    recurringEnd: initialData?.recurringEnd || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Selection */}
          <div>
            <Label htmlFor="courseId">Course *</Label>
            <Select value={formData.courseId} onValueChange={(value) => updateField('courseId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course_1">Mathematics Grade 10</SelectItem>
                <SelectItem value="course_2">Physics Grade 11</SelectItem>
                <SelectItem value="course_3">Chemistry Grade 12</SelectItem>
                <SelectItem value="course_4">English Literature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Class Title */}
          <div>
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Introduction to Algebra"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the class..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                required
              />
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => updateField('time', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Select value={formData.duration.toString()} onValueChange={(value) => updateField('duration', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Repeat className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Recurring Class</p>
                <p className="text-xs text-gray-500">Repeat this class on a schedule</p>
              </div>
            </div>
            <Switch
              checked={formData.isRecurring}
              onCheckedChange={(checked) => updateField('isRecurring', checked)}
            />
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
              <div>
                <Label htmlFor="recurringType">Repeat</Label>
                <Select value={formData.recurringType} onValueChange={(value) => updateField('recurringType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recurringEnd">End Date</Label>
                <Input
                  id="recurringEnd"
                  type="date"
                  value={formData.recurringEnd}
                  onChange={(e) => updateField('recurringEnd', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform */}
          <div>
            <Label htmlFor="platform">
              <Video className="w-4 h-4 inline mr-2" />
              Platform *
            </Label>
            <Select value={formData.platform} onValueChange={(value) => updateField('platform', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="meet">Google Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-generate Link */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Auto-generate Meeting Link</p>
                <p className="text-xs text-gray-500">Automatically create meeting link via API</p>
              </div>
            </div>
            <Switch
              checked={formData.autoGenerateLink}
              onCheckedChange={(checked) => updateField('autoGenerateLink', checked)}
            />
          </div>

          {/* Send Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Send Notifications</p>
                <p className="text-xs text-gray-500">Email and SMS to enrolled students</p>
              </div>
            </div>
            <Switch
              checked={formData.sendNotifications}
              onCheckedChange={(checked) => updateField('sendNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{formData.title || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {formData.date && formData.time 
                  ? `${new Date(formData.date).toLocaleDateString()} at ${formData.time}`
                  : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{formData.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium capitalize">{formData.platform}</span>
            </div>
            {formData.isRecurring && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recurring:</span>
                <span className="font-medium capitalize">{formData.recurringType} until {formData.recurringEnd}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Scheduling...' : isEditing ? 'Update Class' : 'Schedule Class'}
        </Button>
      </div>
    </form>
  )
}
