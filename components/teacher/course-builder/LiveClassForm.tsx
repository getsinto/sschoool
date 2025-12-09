'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Video } from 'lucide-react'

interface LiveClassFormProps {
  value?: any
  onChange: (liveClass: any) => void
}

export function LiveClassForm({ value, onChange }: LiveClassFormProps) {
  const [classData, setClassData] = useState({
    title: value?.title || '',
    description: value?.description || '',
    scheduledDate: value?.scheduledDate || '',
    scheduledTime: value?.scheduledTime || '',
    duration: value?.duration || 60, // minutes
    platform: value?.platform || 'zoom', // 'zoom' or 'google-meet'
    autoGenerateMeeting: value?.autoGenerateMeeting || true,
    meetingUrl: value?.meetingUrl || '',
    meetingId: value?.meetingId || '',
    meetingPassword: value?.meetingPassword || '',
    // Meeting settings
    enableWaitingRoom: value?.enableWaitingRoom || true,
    enableRecording: value?.enableRecording || true,
    muteOnEntry: value?.muteOnEntry || true,
    allowScreenSharing: value?.allowScreenSharing || true,
    // Reminders
    sendReminders: value?.sendReminders || true,
    reminder24h: value?.reminder24h || true,
    reminder1h: value?.reminder1h || true,
    reminder15min: value?.reminder15min || true,
    // Attendance
    trackAttendance: value?.trackAttendance || true
  })

  const updateField = (field: string, value: any) => {
    const updated = { ...classData, [field]: value }
    setClassData(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Live Class Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Class Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={classData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter class title"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={classData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="What will be covered in this live class?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Scheduled Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={classData.scheduledDate}
                  onChange={(e) => updateField('scheduledDate', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>
                Scheduled Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="time"
                  value={classData.scheduledTime}
                  onChange={(e) => updateField('scheduledTime', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label>
              Duration (minutes) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={classData.duration}
              onChange={(e) => updateField('duration', parseInt(e.target.value) || 60)}
              min="15"
              step="15"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Platform <span className="text-red-500">*</span>
            </Label>
            <Select
              value={classData.platform}
              onValueChange={(value) => updateField('platform', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Zoom
                  </div>
                </SelectItem>
                <SelectItem value="google-meet">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Google Meet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Generate Meeting</Label>
              <p className="text-sm text-gray-500">
                Automatically create meeting link
              </p>
            </div>
            <Switch
              checked={classData.autoGenerateMeeting}
              onCheckedChange={(checked) => updateField('autoGenerateMeeting', checked)}
            />
          </div>

          {!classData.autoGenerateMeeting && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label>Meeting URL</Label>
                <Input
                  value={classData.meetingUrl}
                  onChange={(e) => updateField('meetingUrl', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meeting ID</Label>
                  <Input
                    value={classData.meetingId}
                    onChange={(e) => updateField('meetingId', e.target.value)}
                    placeholder="123 456 7890"
                  />
                </div>
                <div>
                  <Label>Password (Optional)</Label>
                  <Input
                    value={classData.meetingPassword}
                    onChange={(e) => updateField('meetingPassword', e.target.value)}
                    placeholder="Meeting password"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Waiting Room</Label>
              <p className="text-sm text-gray-500">
                Participants wait before joining
              </p>
            </div>
            <Switch
              checked={classData.enableWaitingRoom}
              onCheckedChange={(checked) => updateField('enableWaitingRoom', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Recording</Label>
              <p className="text-sm text-gray-500">
                Automatically record the session
              </p>
            </div>
            <Switch
              checked={classData.enableRecording}
              onCheckedChange={(checked) => updateField('enableRecording', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mute Participants on Entry</Label>
              <p className="text-sm text-gray-500">
                Participants join muted
              </p>
            </div>
            <Switch
              checked={classData.muteOnEntry}
              onCheckedChange={(checked) => updateField('muteOnEntry', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Screen Sharing</Label>
              <p className="text-sm text-gray-500">
                Let participants share their screen
              </p>
            </div>
            <Switch
              checked={classData.allowScreenSharing}
              onCheckedChange={(checked) => updateField('allowScreenSharing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Reminders</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Send reminder emails to enrolled students
              </p>
            </div>
            <Switch
              checked={classData.sendReminders}
              onCheckedChange={(checked) => updateField('sendReminders', checked)}
            />
          </div>
        </CardHeader>
        {classData.sendReminders && (
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>24 hours before</Label>
              <Switch
                checked={classData.reminder24h}
                onCheckedChange={(checked) => updateField('reminder24h', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>1 hour before</Label>
              <Switch
                checked={classData.reminder1h}
                onCheckedChange={(checked) => updateField('reminder1h', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>15 minutes before</Label>
              <Switch
                checked={classData.reminder15min}
                onCheckedChange={(checked) => updateField('reminder15min', checked)}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Track Attendance</Label>
              <p className="text-sm text-gray-500">
                Record who attended the live class
              </p>
            </div>
            <Switch
              checked={classData.trackAttendance}
              onCheckedChange={(checked) => updateField('trackAttendance', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
