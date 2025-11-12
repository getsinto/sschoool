'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Download, 
  Play, 
  Clock, 
  Calendar,
  FileVideo,
  Loader2
} from 'lucide-react';

interface Recording {
  id: string;
  recording_start: string;
  recording_end: string;
  duration: number;
  file_size: number;
  play_url: string;
  download_url: string;
  recording_type: string;
  status: string;
}

interface RecordingsListProps {
  meetingId: string;
}

export function RecordingsList({ meetingId }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [meetingId]);

  const fetchRecordings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/zoom/recordings/${meetingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }

      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (url: string, recordingId: string) => {
    window.open(url, '_blank');
  };

  const handlePlay = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading recordings...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-600">
          <p>Error loading recordings: {error}</p>
          <Button onClick={fetchRecordings} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No recordings available</h3>
        <p className="text-gray-600">
          Recordings will appear here after the meeting is recorded
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5" />
          Meeting Recordings ({recordings.length})
        </h3>
      </div>

      {recordings.map((recording) => (
        <Card key={recording.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <FileVideo className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">
                    {recording.recording_type === 'shared_screen_with_speaker_view' 
                      ? 'Screen Share with Speaker' 
                      : recording.recording_type === 'shared_screen_with_gallery_view'
                      ? 'Screen Share with Gallery'
                      : 'Speaker View'}
                  </h4>
                  <Badge variant="outline" className="mt-1">
                    {recording.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(recording.recording_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(recording.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>{formatFileSize(recording.file_size)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePlay(recording.play_url)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(recording.download_url, recording.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
