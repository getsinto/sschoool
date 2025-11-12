'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  joinTime: string;
  leaveTime?: string;
  duration: number;
  status: 'present' | 'left' | 'waiting';
}

interface AttendanceTrackerProps {
  meetingId: string;
  isHost?: boolean;
  onExportAttendance?: () => void;
}

export function AttendanceTracker({
  meetingId,
  isHost = false,
  onExportAttendance
}: AttendanceTrackerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchParticipants();
      // Set up real-time updates
      const interval = setInterval(fetchParticipants, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible, meetingId]);

  const fetchParticipants = async () => {
    if (!isHost) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/zoom/participants/${meetingId}`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      const response = await fetch(`/api/zoom/attendance/${meetingId}?format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${meetingId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'left':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'left':
        return 'bg-red-100 text-red-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isHost) {
    return null; // Only show to hosts
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50"
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4 mr-2" />
        ) : (
          <Eye className="h-4 w-4 mr-2" />
        )}
        Attendance ({participants.length})
      </Button>

      {/* Attendance Panel */}
      {isVisible && (
        <Card className="fixed top-16 right-4 w-80 max-h-96 overflow-hidden z-40 bg-white shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold">Live Attendance</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAttendance}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Total: {participants.length}</span>
              <span>Present: {participants.filter(p => p.status === 'present').length}</span>
            </div>
          </div>
          
          {/* Participants List */}
          <div className="overflow-y-auto max-h-64 p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No participants yet
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(participant.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(participant.status)}
                      >
                        {formatDuration(participant.duration)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
