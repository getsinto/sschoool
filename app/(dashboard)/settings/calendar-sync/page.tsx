'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CalendarSync } from '@/components/google-meet/CalendarSync'
import { useGoogleMeet } from '@/hooks/useGoogleMeet'
import { Calendar, RefreshCw, Settings, Info, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/hooks/useUser'

export default function CalendarSyncPage() {
  const { user } = useUser()
  const { status, loading } = useGoogleMeet()
  const { toast } = useToast()
  
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncOnCreate: true,
    syncOnUpdate: true,
    syncOnDelete: true,
    sendInvites: true,
    includeDescription: true,
    syncReminders: true
  })

  const [saving, setSaving] = useState(false)

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/settings/calendar-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncSettings)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast({
        title: 'Settings Saved',
        description: 'Calendar sync preferences updated successfully'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar Sync Settings</h1>
        <p className="text-muted-foreground">
          Manage how your live classes sync with Google Calendar
        </p>
      </div>

      {!status?.configured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Google Meet is not configured. Please contact your administrator to set up Google integration.
          </AlertDescription>
        </Alert>
      )}

      {status?.configured && !status?.connected && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please connect your Google account in{' '}
            <a href="/teacher/integrations/google" className="underline">
              Integrations
            </a>{' '}
            to enable calendar sync.
          </AlertDescription>
        </Alert>
      )}

      {status?.connected && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Connection Status
                  </CardTitle>
                  <CardDescription>Your Google Calendar integration status</CardDescription>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                {status.integration && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Token Expires</span>
                    <span className="font-medium">
                      {new Date(status.integration.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sync Preferences
              </CardTitle>
              <CardDescription>
                Configure how live classes sync with your Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync changes to Google Calendar
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.autoSync}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, autoSync: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sync on Create</Label>
                    <p className="text-sm text-muted-foreground">
                      Create calendar event when scheduling new class
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnCreate}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncOnCreate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sync on Update</Label>
                    <p className="text-sm text-muted-foreground">
                      Update calendar event when class details change
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnUpdate}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncOnUpdate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sync on Delete</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove calendar event when class is cancelled
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnDelete}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncOnDelete: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      Send calendar invites to enrolled students
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.sendInvites}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, sendInvites: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Description</Label>
                    <p className="text-sm text-muted-foreground">
                      Add class description to calendar event
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.includeDescription}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, includeDescription: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sync Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Add email and popup reminders to calendar events
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncReminders}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncReminders: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {user && <CalendarSync userId={user.id} />}

          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution</CardTitle>
              <CardDescription>
                How to handle scheduling conflicts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  If a time slot conflicts with an existing calendar event, you'll be notified
                  before creating the class. You can choose to proceed or select a different time.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
