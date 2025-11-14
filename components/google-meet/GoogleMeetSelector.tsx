'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGoogleMeet } from '@/hooks/useGoogleMeet';
import { Video, Calendar, Users, ExternalLink, Loader2, CheckCircle } from 'lucide-react';

interface GoogleMeetSelectorProps {
  liveClassId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  onMeetingCreated?: (meetLink: string, eventId: string) => void;
}

export function GoogleMeetSelector({
  liveClassId,
  title,
  description,
  startTime,
  endTime,
  attendees = [],
  onMeetingCreated
}: GoogleMeetSelectorProps) {
  const { status, loading, error, createMeeting } = useGoogleMeet();
  const [creating, setCreating] = useState(false);
  const [meetingData, setMeetingData] = useState<{
    meetLink: string;
    eventId: string;
    calendarLink: string;
  } | null>(null);

  const handleCreateMeeting = async () => {
    try {
      setCreating(true);
      const meeting = await createMeeting({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        attendees,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        live_class_id: liveClassId
      });

      setMeetingData({
        meetLink: meeting.meetLink,
        eventId: meeting.eventId,
        calendarLink: meeting.calendarLink
      });

      if (onMeetingCreated) {
        onMeetingCreated(meeting.meetLink, meeting.eventId);
      }
    } catch (err) {
      console.error('Failed to create meeting:', err);
    } finally {
      setCreating(false);
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

  if (!status?.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Google Meet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Google Meet is not configured. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Google Meet
          </CardTitle>
          <CardDescription>
            Connect your Google account to use Google Meet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please connect your Google account in Settings to create Google Meet sessions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Google Meet
          <Badge variant="outline" className="ml-auto">Connected</Badge>
        </CardTitle>
        <CardDescription>
          Create a Google Meet session for this live class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!meetingData ? (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(startTime).toLocaleString()} - {new Date(endTime).toLocaleTimeString()}
                </span>
              </div>
              {attendees.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} will be invited
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateMeeting}
              disabled={creating}
              className="w-full"
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Google Meet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Meeting Created Successfully</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Join URL</p>
                <a
                  href={meetingData.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {meetingData.meetLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Calendar Event</p>
                <a
                  href={meetingData.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  View in Google Calendar
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Calendar invites have been sent to all attendees.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
