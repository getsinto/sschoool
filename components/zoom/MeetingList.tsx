'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Meeting {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  start_url: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  participants_count?: number;
  recording_status?: string;
}

interface MeetingListProps {
  meetings: Meeting[];
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  onCopyLink?: (url: string) => void;
  isLoading?: boolean;
}

export function MeetingList({
  meetings,
  onEdit,
  onDelete,
  onCopyLink,
  isLoading = false
}: MeetingListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyLink = (meetingId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(meetingId);
    onCopyLink?.(url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading meetings...</p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No meetings scheduled</h3>
        <p className="text-gray-600 mb-4">
          Create your first live class to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{meeting.topic}</h3>
                <Badge
                  variant="outline"
                  className={getStatusColor(meeting.status)}
                >
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(meeting.start_time)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(meeting.start_time)} ({meeting.duration} min)</span>
                </div>
                {meeting.participants_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{meeting.participants_count} participants</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {meeting.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => window.open(meeting.start_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Start Meeting
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(meeting.id, meeting.join_url)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedId === meeting.id ? 'Copied!' : 'Copy Join Link'}
                    </Button>
                  </>
                )}
                {meeting.status === 'live' && (
                  <Button
                    size="sm"
                    onClick={() => window.open(meeting.start_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join as Host
                  </Button>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {meeting.status === 'scheduled' && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(meeting.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Meeting
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(meeting.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Meeting
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => handleCopyLink(meeting.id, meeting.join_url)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Join Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(meeting.join_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Browser
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}
