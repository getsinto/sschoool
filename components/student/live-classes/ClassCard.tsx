'use client'

import { useState, useEffect } from 'react'
import {
  Video,
  Calendar,
  Clock,
  User,
  Bell,
  BellOff,
  ExternalLink,
  Play,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

interface LiveClass {
  id: string
  title: string
  courseId: string
  courseName: string
  teacher: {
    name: string
    avatar: string
  }
  date: string
  duration: number
  platform: 'Zoom' | 'Google Meet'
  status: 'upcoming' | 'past'
  meetingLink?: string
  password?: string
  hasReminder?: boolean
  attended?: boolean
  durationAttended?: number
  recordingUrl?: string
}

interface ClassCardProps {
  liveClass: LiveClass
}

export default function ClassCard({ liveClass }: ClassCardProps) {
  const [timeUntil, setTimeUntil] = useState('')
  const [canJoin, setCanJoin] = useState(false)
  const [hasReminder, setHasReminder] = useState(liveClass.hasReminder || false)

  useEffect(() => {
    if (liveClass.status === 'upcoming') {
      const updateCountdown = () => {
        const now = new Date()
        const classDate = new Date(liveClass.date)
        const diff = classDate.getTime() - now.getTime()

        // Can join 15 minutes before
        const fifteenMinutes = 15 * 60 * 1000
        setCanJoin(diff <= fifteenMinutes && diff > -liveClass.duration * 60 * 1000)

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeUntil(`${days}d ${hours}h`)
          } else if (hours > 0) {
            setTimeUntil(`${hours}h ${minutes}m`)
          } else {
            setTimeUntil(`${minutes}m`)
          }
        } else {
          setTimeUntil('In progress')
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [liveClass])

  const getPlatformColor = () => {
    return liveClass.platform === 'Zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
  }

  const handleAddToCalendar = () => {
    // Generate calendar event
    const startDate = new Date(liveClass.date)
    const endDate = new Date(startDate.getTime() + liveClass.duration * 60000)
    
    const event = {
      title: liveClass.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: `${liveClass.courseName} - ${liveClass.teacher.name}`,
      location: liveClass.meetingLink
    }
    
    // For demo purposes
    alert('Calendar event would be created')
  }

  const toggleReminder = () => {
    setHasReminder(!hasReminder)
    // API call to toggle reminder
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{liveClass.title}</h3>
              <p className="text-sm text-gray-600">{liveClass.courseName}</p>
            </div>
            <Badge className={getPlatformColor()}>
              {liveClass.platform}
            </Badge>
          </div>

          {/* Teacher */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={liveClass.teacher.avatar} />
              <AvatarFallback>{liveClass.teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{liveClass.teacher.name}</p>
              <p className="text-xs text-gray-600">Instructor</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span>{new Date(liveClass.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span>
                {new Date(liveClass.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' '}({liveClass.duration} min)
              </span>
            </div>
          </div>

          {/* Upcoming Class Actions */}
          {liveClass.status === 'upcoming' && (
            <>
              {/* Countdown */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {canJoin ? 'Class is ready to join!' : `Starts in ${timeUntil}`}
                  </span>
                  {canJoin && (
                    <Badge variant="default" className="animate-pulse">
                      Live
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!canJoin}
                  onClick={() => window.open(liveClass.meetingLink, '_blank')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  {canJoin ? 'Join Now' : 'Join Class'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddToCalendar}
                >
                  <Calendar className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleReminder}
                >
                  {hasReminder ? (
                    <Bell className="w-4 h-4 text-blue-600" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Meeting Details */}
              {liveClass.password && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-semibold">Password:</span> {liveClass.password}
                </div>
              )}
            </>
          )}

          {/* Past Class Info */}
          {liveClass.status === 'past' && (
            <>
              {/* Attendance Status */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                liveClass.attended ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {liveClass.attended ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Attended</p>
                      <p className="text-xs text-green-700">
                        Duration: {liveClass.durationAttended} minutes
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Missed</p>
                      <p className="text-xs text-red-700">You did not attend this class</p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {liveClass.recordingUrl && (
                  <Button className="flex-1" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Recording
                  </Button>
                )}
                <Link href={`/dashboard/student/live-classes/${liveClass.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
