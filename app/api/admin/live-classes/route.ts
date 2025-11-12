import { NextRequest, NextResponse } from 'next/server'

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

// Mock data
const mockClasses: LiveClass[] = [
  {
    id: 'class_1',
    title: 'Introduction to Algebra',
    courseId: 'course_1',
    courseName: 'Mathematics Grade 10',
    teacherId: 'teacher_1',
    teacherName: 'Dr. Sarah Johnson',
    date: '2024-01-20',
    time: '10:00',
    duration: 60,
    platform: 'zoom',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/123456789',
    meetingPassword: 'algebra123',
    attendanceCount: 0,
    maxAttendees: 30
  },
  {
    id: 'class_2',
    title: 'Physics Lab Session',
    courseId: 'course_2',
    courseName: 'Physics Grade 11',
    teacherId: 'teacher_2',
    teacherName: 'Prof. Michael Chen',
    date: '2024-01-19',
    time: '14:30',
    duration: 90,
    platform: 'meet',
    status: 'completed',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    attendanceCount: 25,
    maxAttendees: 30,
    recordingUrl: '/recordings/physics-lab-session.mp4'
  }
]

// GET /api/admin/live-classes - Get all live classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const courseId = searchParams.get('courseId')
    const teacherId = searchParams.get('teacherId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let filteredClasses = [...mockClasses]

    // Apply filters
    if (status && status !== 'all') {
      filteredClasses = filteredClasses.filter(cls => cls.status === status)
    }

    if (platform && platform !== 'all') {
      filteredClasses = filteredClasses.filter(cls => cls.platform === platform)
    }

    if (courseId) {
      filteredClasses = filteredClasses.filter(cls => cls.courseId === courseId)
    }

    if (teacherId) {
      filteredClasses = filteredClasses.filter(cls => cls.teacherId === teacherId)
    }

    if (dateFrom) {
      filteredClasses = filteredClasses.filter(cls => cls.date >= dateFrom)
    }

    if (dateTo) {
      filteredClasses = filteredClasses.filter(cls => cls.date <= dateTo)
    }

    return NextResponse.json({
      classes: filteredClasses,
      total: filteredClasses.length
    })
  } catch (error) {
    console.error('Error fetching live classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live classes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/live-classes - Create new live class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      courseId,
      title,
      description,
      date,
      time,
      duration,
      platform,
      autoGenerateLink,
      sendNotifications,
      isRecurring,
      recurringType,
      recurringEnd
    } = body

    // Validate required fields
    if (!courseId || !title || !date || !time || !duration || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate meeting link if requested
    let meetingLink = ''
    let meetingPassword = ''
    
    if (autoGenerateLink) {
      if (platform === 'zoom') {
        // In real app, integrate with Zoom API
        meetingLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
        meetingPassword = Math.random().toString(36).substring(2, 8)
      } else if (platform === 'meet') {
        // In real app, integrate with Google Meet API
        meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
      }
    }

    // Create new class
    const newClass: LiveClass = {
      id: `class_${Date.now()}`,
      title,
      courseId,
      courseName: 'Course Name', // In real app, fetch from database
      teacherId: 'teacher_1', // In real app, get from session
      teacherName: 'Teacher Name', // In real app, fetch from database
      date,
      time,
      duration: parseInt(duration),
      platform,
      status: 'scheduled',
      meetingLink,
      meetingPassword,
      attendanceCount: 0,
      maxAttendees: 30 // Default or from course settings
    }

    // In real app, save to database
    mockClasses.push(newClass)

    // Send notifications if requested
    if (sendNotifications) {
      // In real app, queue notification jobs
      console.log('Queuing notifications for class:', newClass.id)
    }

    // Handle recurring classes
    if (isRecurring && recurringEnd) {
      // In real app, create recurring class instances
      console.log('Creating recurring classes:', { recurringType, recurringEnd })
    }

    return NextResponse.json({
      message: 'Live class scheduled successfully',
      class: newClass
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating live class:', error)
    return NextResponse.json(
      { error: 'Failed to create live class' },
      { status: 500 }
    )
  }
}