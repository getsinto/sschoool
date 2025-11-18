'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceReport } from '@/components/teacher/live-classes/AttendanceReport';
import { RecordingPlayer } from '@/components/teacher/live-classes/RecordingPlayer';
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Settings
} from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function LiveClassDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { meetingData, isLoading, deleteMeeting } = useZoomMeeting(params.id);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyJoinLink = () => {
    if (meetingData?.join_url) {
      navigator.clipboard.writeText(meetingData.join_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeeting(params.id, true);
      router.push('/teacher/live-classes');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Meeting not found</h2>
          <p className="text-gray-600 mb-4">
            The meeting you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/teacher/live-classes')}>
            Back to Live Classes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Video className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{meetingData.topic}</h1>
              <Badge
                variant="outline"
                className={getStatusColor(meetingData.classData?.status || 'scheduled')}
              >
                {meetingData.classData?.status || 'Scheduled'}
              </Badge>
            </div>
            <p className="text-gray-600">{meetingData.agenda}</p>
          </div>

          <div className="flex gap-2">
            {meetingData.classData?.status === 'scheduled' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/teacher/live-classes/edit/${params.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Info Card */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatDate(meetingData.start_time)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold">
                {formatTime(meetingData.start_time)} ({meetingData.duration} min)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Meeting ID</p>
              <p className="font-semibold font-mono">{meetingData.id}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {meetingData.classData?.status === 'scheduled' && (
            <Button onClick={() => window.open(meetingData.start_url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Start Meeting
            </Button>
          )}
          {meetingData.classData?.status === 'live' && (
            <Button onClick={() => window.open(meetingData.start_url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Join as Host
            </Button>
          )}
          <Button variant="outline" onClick={handleCopyJoinLink}>
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Join Link'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(meetingData.join_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Join Page
          </Button>
        </div>

        {meetingData.password && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm">
              <strong>Password:</strong> {meetingData.password}
            </p>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Meeting Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Join URL</p>
                <p className="font-mono text-sm break-all">{meetingData.join_url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start URL (Host Only)</p>
                <p className="font-mono text-sm break-all">{meetingData.start_url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timezone</p>
                <p>{meetingData.timezone}</p>
              </div>
              {meetingData.classData?.course_id && (
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p>{meetingData.classData.course_id}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTracker meetingId={params.id} isHost={true} />
        </TabsContent>

        <TabsContent value="recordings">
          <RecordingsList meetingId={params.id} />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Meeting Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span>Waiting Room</span>
                <Badge variant={meetingData.settings?.waiting_room ? 'default' : 'secondary'}>
                  {meetingData.settings?.waiting_room ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Join Before Host</span>
                <Badge variant={meetingData.settings?.join_before_host ? 'default' : 'secondary'}>
                  {meetingData.settings?.join_before_host ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Mute Upon Entry</span>
                <Badge variant={meetingData.settings?.mute_upon_entry ? 'default' : 'secondary'}>
                  {meetingData.settings?.mute_upon_entry ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Auto Recording</span>
                <Badge variant="outline">
                  {meetingData.settings?.auto_recording || 'None'}
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Cancel Meeting?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this meeting? This action cannot be undone.
              Participants will be notified.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep Meeting
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Cancel Meeting
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
