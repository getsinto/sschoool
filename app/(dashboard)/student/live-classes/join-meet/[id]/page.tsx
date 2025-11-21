'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface LiveClass {
  id: string
  title: string
  description: string
  scheduled_at: string
  duration: number
  join_url: string
  status: string
  platform: string
  courses: {
    title: string
  }
  users: {
    full_name: string
  }
}

export default function JoinGoogleMeetPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const classId = params.id as string

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchLiveClass()
  }, [classId])

  const fetchLiveClass = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/live-classes/${classId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch live class')
      }

      const data = await response.json()
      setLiveClass(data)
    } catch (error) {
      console.error('Error fetching live class:', error)
      toast({
        title: 'Error',
        description: 'Failed to load live class information',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMeeting = () => {
    if (!liveClass?.join_url) return

    setJoining(true)
    
    // Open Google Meet in new tab
    window.open(liveClass.join_url, '_blank', 'noopener,noreferrer')
    
    // Mark attendance
    markAttendance()
    
    setTimeout(() => setJoining(false), 2000)
  }

  const markAttendance = async () => {
    try {
      await fetch(`/api/student/live-classes/${classId}/join`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error marking attendance:', error)
    }
  }

  const getTimeUntilClass = () => {
    if (!liveClass) return null
    
    const now = new Date()
    const classTime = new Date(liveClass.scheduled_at)
    const diff = classTime.getTime() - now.getTime()
    
    if (diff < 0) {
      return 'Class has started'
    }
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `Starts in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`
    return 'Starting now'
  }

  const canJoin = () => {
    if (!liveClass) return false
    
    const now = new Date()
    const classTime = new Date(liveClass.scheduled_at)
    const endTime = new Date(classTime.getTime() + liveClass.duration * 60000)
    
    // Allow joining 15 minutes before and during the class
    const joinWindow = new Date(classTime.getTime() - 15 * 60000)
    
    return now >= joinWindow && now <= endTime
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!liveClass) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Live class not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{liveClass.title}</h1>
          <p className="text-muted-foreground">{liveClass.courses.title}</p>
        </div>
        <Badge variant={liveClass.status === 'scheduled' ? 'default' : 'secondary'}>
          {liveClass.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Join Google Meet
          </CardTitle>
          <CardDescription>
            {getTimeUntilClass()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(liveClass.scheduled_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(liveClass.scheduled_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} ({liveClass.duration} minutes)
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Instructor: {liveClass.users.full_name}</span>
            </div>
          </div>

          {liveClass.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{liveClass.description}</p>
            </div>
          )}

          {canJoin() ? (
            <Button
              onClick={handleJoinMeeting}
              disabled={joining || !liveClass.join_url}
              className="w-full"
              size="lg"
            >
              {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Video className="mr-2 h-4 w-4" />
              Join Google Meet
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Alert>
              <AlertDescription>
                You can join this class 15 minutes before the scheduled start time.
              </AlertDescription>
            </Alert>
          )}

          {liveClass.join_url && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Meeting Link</p>
              <a
                href={liveClass.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
              >
                {liveClass.join_url}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before You Join</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Make sure you have a stable internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Test your camera and microphone before joining</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Find a quiet place with good lighting</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Have your course materials ready</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Join a few minutes early to avoid missing the start</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/student/live-classes')}
          className="flex-1"
        >
          Back to Live Classes
        </Button>
      </div>
    </div>
  )
}
