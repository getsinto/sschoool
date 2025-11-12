'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface LiveClass {
  id: string;
  title: string;
  course_name: string;
  scheduled_at: string;
  duration: number;
  status: string;
  meeting_id: string;
  join_url: string;
  child_name: string;
}

export default function ParentLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchLiveClasses();
  }, [filter]);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      // Fetch live classes for all children
      const response = await fetch(`/api/parent/live-classes?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Live Classes</h1>
        <p className="text-gray-600">
          View and monitor your children's live classes
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Classes
        </Button>
        <Button
          variant={filter === 'past' ? 'default' : 'outline'}
          onClick={() => setFilter('past')}
        >
          Past Classes
        </Button>
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : classes.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No live classes found</h3>
          <p className="text-gray-600">
            {filter === 'upcoming' 
              ? 'There are no upcoming live classes scheduled'
              : 'No live classes found for the selected filter'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {classes.map((liveClass) => (
            <Card key={liveClass.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{liveClass.title}</h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(liveClass.status)}
                    >
                      {liveClass.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{liveClass.child_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(liveClass.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(liveClass.scheduled_at)} ({liveClass.duration} min)</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    Course: {liveClass.course_name}
                  </p>

                  {liveClass.status === 'live' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded mb-3">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        This class is currently live
                      </span>
                    </div>
                  )}

                  {(liveClass.status === 'scheduled' || liveClass.status === 'live') && (
                    <Button
                      size="sm"
                      onClick={() => window.open(liveClass.join_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Join Link
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
