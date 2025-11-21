'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MeetEmbedProps {
  meetLink: string
  title?: string
  description?: string
}

export function MeetEmbed({ meetLink, title, description }: MeetEmbedProps) {
  // Note: Google Meet doesn't support iframe embedding for security reasons
  // This component provides a link to open Meet in a new window

  const handleOpenMeet = () => {
    window.open(meetLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Google Meet'}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Google Meet doesn't support embedding. Click the button below to open the meeting in a new window.
          </AlertDescription>
        </Alert>

        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <svg
                className="mx-auto h-16 w-16 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Google Meet Session</p>
            </div>
            <Button onClick={handleOpenMeet}>
              Open in New Window
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Meeting Link</p>
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
          >
            {meetLink}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
