'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGoogleMeet } from '@/hooks/useGoogleMeet';
import { Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function GoogleMeetConnect() {
  const { status, loading, error, connect, disconnect } = useGoogleMeet();
  const [actionLoading, setActionLoading] = useState(false);

  const handleConnect = async () => {
    setActionLoading(true);
    await connect();
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect Google Meet?')) {
      setActionLoading(true);
      await disconnect();
      setActionLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <CardTitle>Google Meet Integration</CardTitle>
        </div>
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

        {!status?.configured && (
          <Alert>
            <AlertDescription>
              Google Meet is not configured. Please add your Google OAuth credentials to the environment variables.
            </AlertDescription>
          </Alert>
        )}

        {status?.configured && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {status.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">
                    {status.connected ? 'Connected' : 'Not Connected'}
                  </p>
                  {status.integration && (
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(status.integration.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {status.connected ? (
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect Google Meet
                </Button>
              )}
            </div>

            {status.integration && (
              <div className="text-sm space-y-2">
                <p className="font-medium">Permissions:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {status.integration.scopes.map((scope, index) => (
                    <li key={index}>{scope.split('/').pop()}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create Google Meet meetings automatically</li>
                <li>Sync with Google Calendar</li>
                <li>Send calendar invites to students</li>
                <li>Manage meetings from your dashboard</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
