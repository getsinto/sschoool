'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  Video,
  Play,
  Edit,
  Eye,
  XCircle,
  Plus,
  Grid3x3,
  List,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// Mock data
const mockClasses = [
  {
    id: '1',
    title: 'Advanced Mathematics - Calculus',
    course: 'Grade 10 Mathematics',
    dateTime: '2024-01-20T10:00:00',
    duration: 60,
    platform: 'Zoom',
    expectedAttendees: 25,
    actualAttendees: 23,
    status: 'upcoming',
    meetingLink: 'https://zoom.us/j/123456789',
    canJoin: false
  },
  {
    id: '2',
    title: 'Physics Lab Discussion',
    course: 'Grade 9 Physics',
    dateTime: '2024-01-20T14:30:00',
    duration: 90,
    platform: 'Google Meet',
    expectedAttendees: 18,
    actualAttendees: 18,
    status: 'ongoing',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    canJoin: true
  },
  {
    id: '3',
    title: 'English Literature Review',
    course: 'Grade 8 English',
    dateTime: '2024-01-18T16:00:00',
    duration: 45,
    platform: 'Zoom',
    expectedAttendees: 22,
    actualAttendees: 20,
    status: 'completed',
    hasRecording: true,
    meetingLink: 'https://zoom.us/j/987654321'
  }
]

export default function TeacherLiveClassesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('upcoming')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zoom': return 'bg-blue-600 text-white'
      case 'google meet': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getTimeUntil = (dateTime: string) => {
    const now = new Date()
    const classTime = new Date(dateTime)
    const diff = classTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) return 'Started'
    if (hours > 24) return `${Math.floor(hours / 24)} days`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const filteredClasses = mockClasses.filter(cls => {
    if (activeTab === 'upcoming') return cls.status === 'upcoming' || cls.status === 'ongoing'
    if (activeTab === 'past') return cls.status === 'completed' || cls.status === 'cancelled'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600 mt-1">Manage your scheduled live sessions</p>
        </div>
        <Link href="/teacher/live-classes/create">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Schedule New Class
          </Button>
        </Link>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Classes Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(cls.status)}>
                      {cls.status}
                    </Badge>
                    <Badge className={getPlatformColor(cls.platform)}>
                      {cls.platform}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{cls.title}</CardTitle>
                  <p className="text-sm text-gray-600">{cls.course}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(cls.dateTime).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(cls.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '}({cls.duration} min)
                    </span>
                  </div>

                  {/* Countdown for upcoming */}
                  {cls.status === 'upcoming' && (
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-sm font-medium text-blue-900">
                        Starts in {getTimeUntil(cls.dateTime)}
                      </p>
                    </div>
                  )}

                  {/* Attendees */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {cls.status === 'completed' 
                        ? `${cls.actualAttendees}/${cls.expectedAttendees} attended`
                        : `${cls.expectedAttendees} expected`
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {cls.canJoin && cls.status === 'ongoing' && (
                      <Button className="flex-1" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Join Now
                      </Button>
                    )}
                    
                    {cls.status === 'upcoming' && !cls.canJoin && (
                      <>
                        <Link href={`/dashboard/teacher/live-classes/${cls.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {cls.status === 'completed' && (
                      <>
                        <Link href={`/dashboard/teacher/live-classes/${cls.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </Link>
                        {cls.hasRecording && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Platform</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Attendees</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{cls.title}</p>
                          <p className="text-sm text-gray-500">{cls.course}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(cls.dateTime).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{cls.duration} min</td>
                      <td className="py-3 px-4">
                        <Badge className={getPlatformColor(cls.platform)}>
                          {cls.platform}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cls.status === 'completed' 
                          ? `${cls.actualAttendees}/${cls.expectedAttendees}`
                          : cls.expectedAttendees
                        }
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(cls.status)}>
                          {cls.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {cls.canJoin && (
                            <Button size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Link href={`/dashboard/teacher/live-classes/${cls.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredClasses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming classes scheduled"
                : "No past classes to display"
              }
            </p>
            <Link href="/dashboard/teacher/live-classes/schedule">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Class
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
