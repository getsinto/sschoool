'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AttendanceTable from '@/components/admin/live-classes/AttendanceTable'
import RecordingUploader from '@/components/admin/live-classes/RecordingUploader'
import { 
  ArrowLeft, 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Copy, 
  ExternalLink,
  Edit,
  Trash2,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface LiveClass {
  id: string
  title: string
  description?: string
  courseId: string
  courseName: string
  teacherId: string
  teacherName: string
  date: string
  time: string
  duration: number
  platform: 'zoom' | 'meet'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  meetingLink?: string
  meetingPassword?: string
  attendanceCount: number
  maxAttendees: number
  recordingUrl?: string
  recordingStatus?: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string
  email: string
  joinTime: string
  leaveTime: string | null
  duration: number
  status: 'present' | 'absent' | 'late'
}

export default function LiveClassDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [classData, setClassData] = useState<LiveClass | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchClassData()
    fetchAttendance()
  }, [params.id])

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/admin/live-classes/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch class')
      
      const data = await response.json()
      setClassData(data.class)
    } catch (error) {
      console.error('Error fetching class:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/admin/live-classes/${params.id}/attendance`)
      if (!response.ok) throw new Error('Failed to fetch attendance')
      
      const data = await response.json()
      setAttendance(data.attendance || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleCopyLink = async () => {
    if (!classData?.meetingLink) return
    
    try {
      await navigator.clipboard.writeText(classData.meetingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleExportAttendance = () => {
    // In real app, generate CSV/Excel file
    console.log('Exporting attendance...')
    alert('Attendance export feature coming soon')
  }

  const handleDeleteClass = async () => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const response = await fetch(`/api/admin/live-classes/${params.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete class')
      
      router.push('/admin/live-classes')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class details...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Not Found</h3>
          <p className="text-gray-600 mb-4">The class you're looking for doesn't exist.</p>
          <Link href="/admin/live-classes">
            <Button>Back to Classes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/live-classes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Classes
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.title}</h1>
            <p className="text-gray-600">{classData.courseName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {classData.status === 'scheduled' && (
            <>
              <Button variant="outline" onClick={() => router.push(`/admin/live-classes/${params.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button asChild>
                <a href={classData.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Play className="w-4 h-4 mr-2" />
                  Start Class
                </a>
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={handleDeleteClass}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Class Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Information</CardTitle>
                {getStatusBadge(classData.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {classData.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{classData.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Teacher</h4>
                  <p className="text-gray-900">{classData.teacherName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Platform</h4>
                  <Badge variant="outline" className={classData.platform === 'zoom' ? 'text-blue-600' : 'text-green-600'}>
                    <Video className="w-3 h-3 mr-1" />
                    {classData.platform}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date & Time
                  </h4>
                  <p className="text-gray-900">
                    {new Date(classData.date).toLocaleDateString()} at {classData.time}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </h4>
                  <p className="text-gray-900">{classData.duration} minutes</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Attendance
                </h4>
                <p className="text-gray-900">{classData.attendanceCount} / {classData.maxAttendees} students</p>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Link Card */}
          {classData.meetingLink && (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Join URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={classData.meetingLink}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={classData.meetingLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {classData.meetingPassword && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                    <input
                      type="text"
                      value={classData.meetingPassword}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attendance Table */}
          <AttendanceTable
            classId={params.id}
            attendance={attendance}
            onExport={handleExportAttendance}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recording Uploader */}
          <RecordingUploader
            classId={params.id}
            autoFetchFromPlatform={classData.status === 'completed'}
            platform={classData.platform}
          />

          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Attendance</span>
                <span className="font-medium">{classData.attendanceCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-medium">
                  {Math.round((classData.attendanceCount / classData.maxAttendees) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Duration</span>
                <span className="font-medium">
                  {attendance.length > 0 
                    ? Math.round(attendance.reduce((sum, r) => sum + r.duration, 0) / attendance.length) + ' min'
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
