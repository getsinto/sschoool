'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PreMeetingCheck } from '@/components/zoom/PreMeetingCheck';
import { ZoomMeetingEmbed } from '@/components/zoom/ZoomMeetingEmbed';
import { useAuth } from '@/hooks/useAuth';
import { 
  Video, 
  Clock, 
  Users, 
  Calendar,
  Loader2,
  AlertCircle 
} from 'lucide-react';

export default function JoinLiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreCheck, setShowPreCheck] = useState(true);
  const [meetingStarted, setMeetingStarted] = useState(false);

  const classId = params.id as string;

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/live-classes/${classId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch class data');
      }
      const data = await response.json();
      setClassData(data.class);
    } catch (err) {
      setError('Unable to load class information');
    } finally {
      setLoading(false);
    }
  };

  const handlePreCheckComplete = (settings: any) => {
    setShowPreCheck(false);
    setMeetingStarted(true);
  };

  const handleMeetingEnd = () => {
    router.push('/student/live-classes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Join Class</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/student/live-classes')}>
            Back to Live Classes
          </Button>
        </Card>
      </div>
    );
  }

  if (showPreCheck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{classData.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(classData.scheduled_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date(classData.scheduled_at).toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {classData.duration} minutes
            </div>
          </div>
        </div>

        <PreMeetingCheck onComplete={handlePreCheckComplete} />
      </div>
    );
  }

  if (meetingStarted && classData.meeting_id) {
    return (
      <ZoomMeetingEmbed
        meetingNumber={classData.meeting_id}
        password={classData.meeting_password}
        userName={user?.full_name || 'Student'}
        userEmail={user?.email}
        role={0}
        onMeetingEnd={handleMeetingEnd}
      />
    );
  }

  return null;
}
