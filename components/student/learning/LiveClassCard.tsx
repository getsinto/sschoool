'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Video, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VideoPlayer from './VideoPlayer'

interface LiveClassCardProps {
  liveClass: {
    id: string
    title: string
    description: string
    scheduledAt: string
    duration: number
    platform: 'zoom' | 'google_meet' | 'teams'
    status: 'upcoming' | 'ongoing' | 'completed'
    recordingUrl?: string
    recordingDuration?: number
    allowRecordingDownload?: boolean
    attendance?: {
      present: boolean
      joinedAt?: string
      leftAt?: string
    }
  }
  lessonId: string
  onComplete: () => void
}

export default function LiveClassCard({ liveClass, lessonId, onComplete }: LiveClassCardProps) {
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0)
  const [canJoin, setCanJoin] = useState(false)
  const [joinDetails, setJoinDetails] = useState<any>(null)
  const [showRecording, setShowRecording] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const start = new Date(liveClass.scheduledAt).getTime()
      const diff = start - now
      
      setTimeUntilStart(diff)
      // Allow joining 15 minutes before start
      setCanJoin(diff <= 15 * 60 * 1000 && diff > -liveClass.duration * 60 * 1000)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [liveClass.scheduledAt, liveClass.duration])

  const formatTimeUntil = (ms: number) => {
    if (ms < 0) return 'Started'
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    return `${minutes}m ${seconds}s`
  }

  const handleJoinClass = async () => {
    try {
      const response = await fetch(`/api/student/live-classes/${liveClass.id}/join`)
      const data = await response.json()
      
      if (data.success) {
        setJoinDetails(data.data)
        // Open meeting in new window
        window.open(data.data.meetingUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to join class:', error)
    }
  }

  const addToCalendar = () => {
    const start = new Date(liveClass.scheduledAt)
    const end = new Date(start.getTime() + liveClass.duration * 60 * 1000)
    
    const event = {
      title: liveClass.title,
      start: start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: liveClass.description
    }
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`
    window.open(url, '_blank')
  }

  const getPlatformBadge = () => {
    const platforms = {
      zoom: { name: 'Zoom', color: 'bg-blue-500' },
      google_meet: { name: 'Google Meet', color: 'bg-green-500' },
      teams: { name: 'Teams', color: 'bg-purple-500' }
    }
    
    const platform = platforms[liveClass.platform]
    return (
      <Badge className={`${platform.color} text-white`}>
        {platform.name}
      </Badge>
    )
  }

  const getStatusBadge = () => {
    const statusConfig = {
      upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
      ongoing: { label: 'Live Now', color: 'bg-red-100 text-red-800 animate-pulse' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[liveClass.status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  // Show recording player for completed classes
  if (liveClass.status === 'completed' && showRecording && liveClass.recordingUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{liveClass.title} - Recording</h3>
          <Button variant="outline" onClick={() => setShowRecording(false)}>
            Back to Details
          </Button>
        </div>
        
        <VideoPlayer
          videoUrl={liveClass.recordingUrl}
          lessonId={lessonId}
          onProgressUpdate={() => {}}
          onComplete={onComplete}
        />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {liveClass.title}
            </CardTitle>
            <p className="text-gray-600 mt-1">{liveClass.description}</p>
          </div>
          <div className="flex gap-2">
            {getPlatformBadge()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Class Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{new Date(liveClass.scheduledAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{new Date(liveClass.scheduledAt).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{liveClass.duration} minutes</span>
          </div>
          {liveClass.attendance && (
            <div className="flex items-center gap-2">
              <Badge variant={liveClass.attendance.present ? 'default' : 'secondary'}>
                {liveClass.attendance.present ? 'Present' : 'Absent'}
              </Badge>
            </div>
          )}
        </div>

        {/* Upcoming Class */}
        {liveClass.status === 'upcoming' && (
          <div className="space-y-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Starts in</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTimeUntil(timeUntilStart)}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleJoinClass}
                disabled={!canJoin}
                className="flex-1"
              >
                {canJoin ? 'Join Class' : 'Join Available 15 min Before'}
              </Button>
              <Button variant="outline" onClick={addToCalendar}>
                <Calendar className="w-4 h-4 mr-1" />
                Add to Calendar
              </Button>
            </div>
            
            {joinDetails && (
              <div className="p-3 bg-gray-50 rounded text-sm">
                <p><strong>Meeting ID:</strong> {joinDetails.meetingId}</p>
                {joinDetails.password && (
                  <p><strong>Password:</strong> {joinDetails.password}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ongoing Class */}
        {liveClass.status === 'ongoing' && (
          <div className="space-y-3">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-lg font-semibold text-red-600 animate-pulse">
                🔴 LIVE NOW
              </p>
            </div>
            
            <Button 
              onClick={handleJoinClass}
              className="w-full bg-red-600 hover:bg-red-700 animate-pulse"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Now
            </Button>
          </div>
        )}

        {/* Completed Class */}
        {liveClass.status === 'completed' && (
          <div className="space-y-3">
            {liveClass.recordingUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Recording Available</span>
                  {liveClass.recordingDuration && (
                    <span>{Math.floor(liveClass.recordingDuration / 60)} minutes</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => setShowRecording(true)} className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Watch Recording
                  </Button>
                  
                  {liveClass.allowRecordingDownload && (
                    <Button variant="outline" onClick={() => window.open(liveClass.recordingUrl, '_blank')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Recording not available</p>
              </div>
            )}
            
            <Button onClick={onComplete} variant="outline" className="w-full">
              Continue to Next Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
