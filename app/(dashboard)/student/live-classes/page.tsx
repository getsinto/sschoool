'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Grid,
  List,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClassCard from '@/components/student/live-classes/ClassCard'

// Mock data
const mockClasses = [
  {
    id: 'lc1',
    title: 'Quadratic Equations - Live Session',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    teacher: {
      name: 'Prof. Anderson',
      avatar: '/avatars/prof-anderson.jpg'
    },
    date: '2024-02-01T14:00:00',
    duration: 60,
    platform: 'Zoom',
    status: 'upcoming',
    meetingLink: 'https://zoom.us/j/123456789',
    password: 'math2024',
    hasReminder: true
  },
  {
    id: 'lc2',
    title: 'Physics Lab Discussion',
    courseId: 'c2',
    courseName: 'Physics Fundamentals',
    teacher: {
      name: 'Dr. Sarah Johnson',
      avatar: '/avatars/dr-johnson.jpg'
    },
    date: '2024-02-03T10:00:00',
    duration: 90,
    platform: 'Google Meet',
    status: 'upcoming',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    hasReminder: false
  },
  {
    id: 'lc3',
    title: 'Essay Writing Workshop',
    courseId: 'c3',
    courseName: 'English Literature',
    teacher: {
      name: 'Prof. Michael Chen',
      avatar: '/avatars/prof-chen.jpg'
    },
    date: '2024-01-20T15:00:00',
    duration: 75,
    platform: 'Zoom',
    status: 'past',
    attended: true,
    durationAttended: 75,
    recordingUrl: 'https://example.com/recording/lc3'
  },
  {
    id: 'lc4',
    title: 'World War II Q&A Session',
    courseId: 'c4',
    courseName: 'World History',
    teacher: {
      name: 'Dr. Emily Rodriguez',
      avatar: '/avatars/dr-rodriguez.jpg'
    },
    date: '2024-01-18T13:00:00',
    duration: 60,
    platform: 'Google Meet',
    status: 'past',
    attended: false,
    recordingUrl: 'https://example.com/recording/lc4'
  }
]

const mockStats = {
  upcoming: 2,
  attended: 1,
  missed: 1,
  totalHours: 3.5
}

export default function LiveClassesPage() {
  const [classes] = useState(mockClasses)
  const [stats] = useState(mockStats)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')

  // Get unique courses
  const courses = Array.from(new Set(classes.map(c => c.courseName)))

  // Filter classes
  const filteredClasses = classes
    .filter(cls => {
      const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCourse = filterCourse === 'all' || cls.courseName === filterCourse
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'upcoming' && cls.status === 'upcoming') ||
                        (activeTab === 'past' && cls.status === 'past')
      
      return matchesSearch && matchesCourse && matchesTab
    })
    .sort((a, b) => {
      if (activeTab === 'upcoming') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Live Classes</h1>
        <p className="text-gray-600">Join live sessions with your instructors</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attended</p>
                <p className="text-3xl font-bold text-green-600">{stats.attended}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Missed</p>
                <p className="text-3xl font-bold text-red-600">{stats.missed}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalHours}</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Course Filter */}
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredClasses.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ClassCard liveClass={cls} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No classes found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterCourse !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You have no classes in this category'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
