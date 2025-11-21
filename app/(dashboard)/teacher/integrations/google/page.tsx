'use client'

import { GoogleMeetConnect } from '@/components/google-meet/GoogleMeetConnect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Info } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GoogleIntegrationPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!searchParams) return
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_connected') {
      setMessage({ type: 'success', text: 'Google Meet connected successfully!' })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'no_code': 'Authorization code not received',
        'unauthorized': 'You must be logged in',
        'oauth_failed': 'Failed to connect to Google',
        'callback_failed': 'OAuth callback failed'
      }
      setMessage({ 
        type: 'error', 
        text: errorMessages[error] || 'An error occurred during connection' 
      })
    }

    // Clear message after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Google Meet Integration</h1>
        <p className="text-muted-foreground">
          Connect your Google account to create and manage Google Meet sessions for your live classes
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <GoogleMeetConnect />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Connect Your Google Account</h3>
            <p className="text-sm text-muted-foreground">
              Click the "Connect Google Meet" button above to authorize access to your Google Calendar.
              You'll be redirected to Google's secure login page.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Create Live Classes</h3>
            <p className="text-sm text-muted-foreground">
              When scheduling a live class, select Google Meet as the platform. A Google Meet link
              will be automatically created and added to your Google Calendar.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Automatic Invites</h3>
            <p className="text-sm text-muted-foreground">
              All enrolled students will automatically receive calendar invites with the Google Meet
              link. They can join directly from their calendar or from the platform.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">4. Sync & Manage</h3>
            <p className="text-sm text-muted-foreground">
              Any changes you make to the live class (time, attendees, etc.) will automatically sync
              with your Google Calendar and update all participants.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Permissions</CardTitle>
          <CardDescription>
            We request the following permissions to provide Google Meet integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <span className="font-medium">Google Calendar</span>
                <p className="text-muted-foreground">Create and manage calendar events</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <span className="font-medium">Google Meet</span>
                <p className="text-muted-foreground">Create video conference links</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Your Google credentials are securely stored and encrypted. We only access your calendar
            to create and manage events for your live classes.
          </p>
          <p>
            You can disconnect your Google account at any time. This will not delete any existing
            calendar events, but new live classes will not be synced to Google Calendar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
