'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClassCalendar from '@/components/admin/live-classes/ClassCalendar'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LiveClass {
  id: string
  title: string
  courseName: string
  teacherName: string
  date: string
  time: string
  duration: number
  platform: 'zoom' | 'meet'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  attendanceCount: number
}

export default function LiveClassesCalendarPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/admin/live-classes')
      if (!response.ok) throw new Error('Failed to fetch classes')
      
      const data = await response.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassClick = (classId: string) => {
    router.push(`/admin/live-classes/${classId}`)
  }

  const handleDateChange = (date: Date) => {
    console.log('Date changed:', date)
    // Could fetch classes for specific date range
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/live-classes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Calendar</h1>
            <p className="text-gray-600">View and manage scheduled classes</p>
          </div>
        </div>
        <Link href="/admin/live-classes/schedule">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Class
          </Button>
        </Link>
      </div>

      {/* Calendar */}
      <ClassCalendar
        classes={classes}
        onClassClick={handleClassClick}
        onDateChange={handleDateChange}
      />
    </div>
  )
}
