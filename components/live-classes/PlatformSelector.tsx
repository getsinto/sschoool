'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  selected: 'zoom' | 'google_meet';
  onSelect: (platform: 'zoom' | 'google_meet') => void;
  zoomConnected: boolean;
  googleConnected: boolean;
}

export function PlatformSelector({
  selected,
  onSelect,
  zoomConnected,
  googleConnected
}: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Zoom Option */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          selected === 'zoom' && 'ring-2 ring-primary',
          !zoomConnected && 'opacity-60'
        )}
        onClick={() => zoomConnected && onSelect('zoom')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <CardTitle>Zoom</CardTitle>
            </div>
            {selected === 'zoom' && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          <CardDescription>
            Professional video conferencing with advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {zoomConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                Not Connected
              </Badge>
            )}
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Waiting room & password</li>
              <li>• Breakout rooms</li>
              <li>• Recording & transcription</li>
              <li>• Attendance tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Google Meet Option */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          selected === 'google_meet' && 'ring-2 ring-primary',
          !googleConnected && 'opacity-60'
        )}
        onClick={() => googleConnected && onSelect('google_meet')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Google Meet</CardTitle>
            </div>
            {selected === 'google_meet' && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          <CardDescription>
            Simple meetings with Google Calendar integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {googleConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                Not Connected
              </Badge>
            )}
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• No software required</li>
              <li>• Calendar auto-sync</li>
              <li>• Email invitations</li>
              <li>• Easy for students</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
