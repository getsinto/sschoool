'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'

interface NotificationSettings {
  email: {
    enabled: boolean
    gradeUpdates: boolean
    attendanceAlerts: boolean
    assignmentReminders: boolean
    paymentReminders: boolean
    weeklyReports: boolean
    teacherMessages: boolean
    systemAnnouncements: boolean
  }
  sms: {
    enabled: boolean
    urgentAlertsOnly: boolean
    gradeAlerts: boolean
    attendanceAlerts: boolean
    paymentReminders: boolean
  }
  push: {
    enabled: boolean
    gradeUpdates: boolean
    attendanceAlerts: boolean
    messages: boolean
    liveClassReminders: boolean
  }
}

interface NotificationPreferencesProps {
  initialSettings: NotificationSettings
  onSave: (settings: NotificationSettings) => Promise<void>
}

export default function NotificationPreferences({
  initialSettings,
  onSave
}: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = (
    category: 'email' | 'sms' | 'push',
    key: string,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(settings)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Receive updates and alerts via email
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled" className="font-semibold">
              Enable Email Notifications
            </Label>
            <Switch
              id="email-enabled"
              checked={settings.email.enabled}
              onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
            />
          </div>

          {settings.email.enabled && (
            <>
              <Separator />
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-grades">Grade Updates</Label>
                  <Switch
                    id="email-grades"
                    checked={settings.email.gradeUpdates}
                    onCheckedChange={(checked) => updateSetting('email', 'gradeUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-attendance">Attendance Alerts</Label>
                  <Switch
                    id="email-attendance"
                    checked={settings.email.attendanceAlerts}
                    onCheckedChange={(checked) => updateSetting('email', 'attendanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-assignments">Assignment Reminders</Label>
                  <Switch
                    id="email-assignments"
                    checked={settings.email.assignmentReminders}
                    onCheckedChange={(checked) => updateSetting('email', 'assignmentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-payments">Payment Reminders</Label>
                  <Switch
                    id="email-payments"
                    checked={settings.email.paymentReminders}
                    onCheckedChange={(checked) => updateSetting('email', 'paymentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reports">Weekly Reports</Label>
                  <Switch
                    id="email-reports"
                    checked={settings.email.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('email', 'weeklyReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-messages">Teacher Messages</Label>
                  <Switch
                    id="email-messages"
                    checked={settings.email.teacherMessages}
                    onCheckedChange={(checked) => updateSetting('email', 'teacherMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-announcements">System Announcements</Label>
                  <Switch
                    id="email-announcements"
                    checked={settings.email.systemAnnouncements}
                    onCheckedChange={(checked) => updateSetting('email', 'systemAnnouncements', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle>SMS Notifications</CardTitle>
              <CardDescription>
                Receive important alerts via text message
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled" className="font-semibold">
              Enable SMS Notifications
            </Label>
            <Switch
              id="sms-enabled"
              checked={settings.sms.enabled}
              onCheckedChange={(checked) => updateSetting('sms', 'enabled', checked)}
            />
          </div>

          {settings.sms.enabled && (
            <>
              <Separator />
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-urgent">Urgent Alerts Only</Label>
                  <Switch
                    id="sms-urgent"
                    checked={settings.sms.urgentAlertsOnly}
                    onCheckedChange={(checked) => updateSetting('sms', 'urgentAlertsOnly', checked)}
                  />
                </div>

                {!settings.sms.urgentAlertsOnly && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-grades">Grade Alerts</Label>
                      <Switch
                        id="sms-grades"
                        checked={settings.sms.gradeAlerts}
                        onCheckedChange={(checked) => updateSetting('sms', 'gradeAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-attendance">Attendance Alerts</Label>
                      <Switch
                        id="sms-attendance"
                        checked={settings.sms.attendanceAlerts}
                        onCheckedChange={(checked) => updateSetting('sms', 'attendanceAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-payments">Payment Reminders</Label>
                      <Switch
                        id="sms-payments"
                        checked={settings.sms.paymentReminders}
                        onCheckedChange={(checked) => updateSetting('sms', 'paymentReminders', checked)}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Receive real-time notifications in your browser
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled" className="font-semibold">
              Enable Push Notifications
            </Label>
            <Switch
              id="push-enabled"
              checked={settings.push.enabled}
              onCheckedChange={(checked) => updateSetting('push', 'enabled', checked)}
            />
          </div>

          {settings.push.enabled && (
            <>
              <Separator />
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-grades">Grade Updates</Label>
                  <Switch
                    id="push-grades"
                    checked={settings.push.gradeUpdates}
                    onCheckedChange={(checked) => updateSetting('push', 'gradeUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-attendance">Attendance Alerts</Label>
                  <Switch
                    id="push-attendance"
                    checked={settings.push.attendanceAlerts}
                    onCheckedChange={(checked) => updateSetting('push', 'attendanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-messages">Messages</Label>
                  <Switch
                    id="push-messages"
                    checked={settings.push.messages}
                    onCheckedChange={(checked) => updateSetting('push', 'messages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-classes">Live Class Reminders</Label>
                  <Switch
                    id="push-classes"
                    checked={settings.push.liveClassReminders}
                    onCheckedChange={(checked) => updateSetting('push', 'liveClassReminders', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
