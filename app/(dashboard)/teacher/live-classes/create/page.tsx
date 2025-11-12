'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useZoomMeeting } from '@/hooks/useZoomMeeting';
import { ArrowLeft, Video, Calendar, Clock, Users } from 'lucide-react';

export default function CreateLiveClassPage() {
  const router = useRouter();
  const { createMeeting, isLoading } = useZoomMeeting(null);
  
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    start_time: '',
    duration: 60,
    courseId: '',
    password: '',
    waiting_room: true,
    join_before_host: false,
    mute_upon_entry: true,
    auto_recording: 'none' as 'none' | 'local' | 'cloud'
  });

  const [courses, setCourses] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const meetingData = {
        topic: formData.topic,
        type: 2, // Scheduled meeting
        start_time: new Date(formData.start_time).toISOString(),
        duration: formData.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        agenda: formData.description,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: formData.join_before_host,
          mute_upon_entry: formData.mute_upon_entry,
          watermark: false,
          use_pmi: false,
          approval_type: 2,
          audio: 'both',
          auto_recording: formData.auto_recording,
          waiting_room: formData.waiting_room
        },
        password: formData.password,
        courseId: formData.courseId
      };

      await createMeeting(meetingData);
      
      router.push('/teacher/live-classes');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create live class. Please try again.');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Live Class</h1>
        <p className="text-gray-600 mt-2">
          Schedule a new Zoom meeting for your students
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Class Title *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => handleChange('topic', e.target.value)}
                    placeholder="e.g., Mathematics - Chapter 5 Review"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="What will be covered in this class?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="courseId">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => handleChange('courseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course1">Mathematics 101</SelectItem>
                      <SelectItem value="course2">Physics 201</SelectItem>
                      <SelectItem value="course3">Chemistry 301</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                    min={15}
                    max={300}
                    step={15}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Security & Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Meeting Password</Label>
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Optional password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.waiting_room}
                      onChange={(e) => handleChange('waiting_room', e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable waiting room</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.join_before_host}
                      onChange={(e) => handleChange('join_before_host', e.target.checked)}
                      className="rounded"
                    />
                    <span>Allow participants to join before host</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.mute_upon_entry}
                      onChange={(e) => handleChange('mute_upon_entry', e.target.checked)}
                      className="rounded"
                    />
                    <span>Mute participants upon entry</span>
                  </label>
                </div>

                <div>
                  <Label htmlFor="auto_recording">Auto Recording</Label>
                  <Select
                    value={formData.auto_recording}
                    onValueChange={(value: any) => handleChange('auto_recording', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Recording</SelectItem>
                      <SelectItem value="local">Local Recording</SelectItem>
                      <SelectItem value="cloud">Cloud Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Live Class'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
