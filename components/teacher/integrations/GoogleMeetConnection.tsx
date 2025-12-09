'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'

interface GoogleMeetConnectionProps {
  onConnectionChange?: (connected: boolean) => void
}

export function GoogleMeetConnection({ onConnectionChange }: GoogleMeetConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  // Check URL params for OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const successParam = params.get('success')
    const errorParam = params.get('error')

    if (successParam === 'connected') {
      setSuccess('Successfully connected to Google Meet!')
      setIsConnected(true)
      onConnectionChange?.(true)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
      // Recheck status
      checkConnectionStatus()
    } else if (errorParam) {
      setError(`Connection failed: ${errorParam}`)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/google-meet/token')
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsConnected(false)
          onConnectionChange?.(false)
          return
        }
        throw new Error('Failed to check connection status')
      }

      const data = await response.json()

      if (data.connected && data.tokenValid) {
        setIsConnected(true)
        onConnectionChange?.(true)
      } else {
        setIsConnected(false)
        onConnectionChange?.(false)
        
        // If token exists but is invalid, show re-authorization message
        if (data.connected && !data.tokenValid) {
          setError('Your Google Meet connection has expired. Please reconnect.')
        }
      }
    } catch (err) {
      console.error('Error checking connection status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check connection status')
      setIsConnected(false)
      onConnectionChange?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      setSuccess(null)

      // Get OAuth URL
      const response = await fetch('/api/google-meet/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initiate OAuth')
      }

      const data = await response.json()

      if (!data.authUrl) {
        throw new Error('No authorization URL received')
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl
    } catch (err) {
      console.error('Error connecting to Google:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to Google Meet. Please try again.')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Meet? This will remove all stored credentials.')) {
      return
    }

    try {
      setIsDisconnecting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/google-meet/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect')
      }

      setIsConnected(false)
      onConnectionChange?.(false)
      setSuccess('Successfully disconnected from Google Meet')
    } catch (err) {
      console.error('Error disconnecting from Google:', err)
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Google Meet')
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Meet Integration</CardTitle>
          <CardDescription>
            Connect your Google account to create and manage Google Meet sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Meet Integration
          {isConnected ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </CardTitle>
        <CardDescription>
          Connect your Google account to create and manage Google Meet sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {isConnected ? (
            <>
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Connected to Google Meet</h4>
                    <p className="text-sm text-green-700 mt-1">
                      You can now create Google Meet sessions directly from the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={checkConnectionStatus}
                  disabled={isLoading}
                >
                  Refresh Status
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Why connect Google Meet?</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Create Google Meet sessions automatically</li>
                  <li>Sync meetings with Google Calendar</li>
                  <li>Share meeting links with students instantly</li>
                  <li>Manage all your live classes in one place</li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Google Meet
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                By connecting, you'll be redirected to Google to authorize access to your calendar and Google Meet.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
