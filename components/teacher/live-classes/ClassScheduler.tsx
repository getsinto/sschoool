'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, Video, Users, Repeat } from 'lucide-react'

interface ClassSchedulerProps {
  onSchedule: (classData: any) => void
  courses?: any[]
  defaultValues?: any
}

export function ClassScheduler({ onSchedule, courses = [], defaultValues }: ClassSchedulerProps) {
  const [formData, setFormData] = useState({
    title: defaultValues?.title || '',
    courseId: defaultValues?.courseId || '',
    date: defaultValues?.date || '',
    time: defaultValues?.time || '',
    duration: defaultValues?.duration || 60,
    platform: defaultValues?.platform || 'zoom',
    description: defaultValues?.description || '',
    isRecurring: defaultValues?.isRecurring || false,
    recurringFrequency: defaultValues?.recurringFrequency || 'weekly',
    recurringDays: defaultValues?.recurringDays || [],
    recurringEndDate: defaultValues?.recurringEndDate || '',
    recurringOccurrences: defaultValues?.recurringOccurrences || 10,
    settings: {
      waitingRoom: defaultValues?.settings?.waitingRoom ?? true,
      recording: defaultValues?.settings?.recording ?? true,
      muteOnEntry: defaultValues?.settings?.muteOnEntry ?? true,
      allowScreenShare: defaultValues?.settings?.allowScreenShare ?? true
    }
  })

  const handleQuickSchedule = (option: 'today' | 'tomorrow' | 'next-week') => {
    const now = new Date()
    let targetDate = new Date()

    switch (option) {
      case 'today':
        targetDate = now
        break
      case 'tomorrow':
        targetDate.setDate(now.getDate() + 1)
        break
      case 'next-week':
        targetDate.setDate(now.getDate() + 7)
        break
    }

    setFormData({
      ...formData,
      date: targetDate.toISOString().split('T')[0],
      time: '10:00'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSchedule(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Class Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Advanced Mathematics - Calculus"
              required
            />
          </div>

          <div>
            <Label>Course *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will be covered in this class?"
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
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSchedule('today')}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSchedule('tomorrow')}
            >
              Tomorrow
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSchedule('next-week')}
            >
              Next Week
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Duration (minutes) *</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
            >
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

          <div className="flex items-center justify-between">
            <div>
              <Label>Recurring Class</Label>
              <p className="text-sm text-gray-500">Schedule multiple sessions</p>
            </div>
            <Switch
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
            />
          </div>

          {formData.isRecurring && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={formData.recurringFrequency}
                  onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurringFrequency === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.recurringDays.includes(day) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const days = formData.recurringDays.includes(day)
                            ? formData.recurringDays.filter((d: string) => d !== day)
                            : [...formData.recurringDays, day]
                          setFormData({ ...formData, recurringDays: days })
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Or Number of Occurrences</Label>
                  <Input
                    type="number"
                    value={formData.recurringOccurrences}
                    onChange={(e) => setFormData({ ...formData, recurringOccurrences: parseInt(e.target.value) })}
                    min="1"
                    max="52"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="google-meet">Google Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Waiting Room</Label>
              <Switch
                checked={formData.settings.waitingRoom}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, waitingRoom: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto Recording</Label>
              <Switch
                checked={formData.settings.recording}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, recording: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mute on Entry</Label>
              <Switch
                checked={formData.settings.muteOnEntry}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, muteOnEntry: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Screen Share</Label>
              <Switch
                checked={formData.settings.allowScreenShare}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowScreenShare: checked }
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Schedule Class
        </Button>
      </div>
    </form>
  )
}
