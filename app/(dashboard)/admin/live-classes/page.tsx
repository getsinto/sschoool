'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ClassCalendar from '@/components/admin/live-classes/ClassCalendar'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  Video, 
  Users, 
  Clock,
  Play,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface LiveClass {
  id: string
  title: string
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
}

export default function LiveClassesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [statusFilter, platformFilter, courseFilter])

  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (platformFilter !== 'all') params.append('platform', platformFilter)
      if (courseFilter !== 'all') params.append('courseId', courseFilter)

      const response = await fetch(`/api/admin/live-classes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch classes')
      
      const data = await response.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoading(false)
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

  const getPlatformBadge = (platform: string) => {
    return (
      <Badge variant="outline" className={platform === 'zoom' ? 'text-blue-600' : 'text-green-600'}>
        <Video className="w-3 h-3 mr-1" />
        {platform}
      </Badge>
    )
  }

  const filteredClasses = classes.filter(cls => 
    cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClassClick = (classId: string) => {
    router.push(`/admin/live-classes/${classId}`)
  }

  const handleDeleteClass = async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const response = await fetch(`/api/admin/live-classes/${classId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete class')
      
      setClasses(classes.filter(c => c.id !== classId))
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600">Manage live classes and sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/admin/live-classes/calendar">
            <Button variant="outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          <Link href="/admin/live-classes/schedule">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="meet">Google Meet</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <ClassCalendar
          classes={filteredClasses}
          onClassClick={handleClassClick}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Get started by scheduling your first class'}
                </p>
                <Link href="/admin/live-classes/schedule">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Class
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map((cls) => (
              <Card key={cls.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleClassClick(cls.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{cls.title}</CardTitle>
                      <p className="text-sm text-gray-600">{cls.courseName}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(cls.status)}
                      {getPlatformBadge(cls.platform)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{cls.teacherName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>{new Date(cls.date).toLocaleDateString()} at {cls.time}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{cls.duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{cls.attendanceCount} / {cls.maxAttendees} attended</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleClassClick(cls.id) }}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    {cls.status === 'scheduled' && (
                      <>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/admin/live-classes/${cls.id}/edit`) }}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                          <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </a>
                        </Button>
                      </>
                    )}
                    
                    {cls.recordingUrl && (
                      <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        <Download className="w-3 h-3 mr-1" />
                        Recording
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost" onClick={(e) => handleDeleteClass(cls.id, e)}>
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
