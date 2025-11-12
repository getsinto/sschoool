import { NextRequest, NextResponse } from 'next/server'

// Mock class data
const mockClasses = new Map([
  ['class_1', {
    id: 'class_1',
    title: 'Introduction to Algebra',
    description: 'This session covers the fundamental concepts of algebra including variables, equations, and basic problem-solving techniques.',
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
    maxAttendees: 30,
    recordingUrl: null,
    recordingStatus: 'none'
  }]
])

// GET /api/admin/live-classes/[id] - Get class details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classData = mockClasses.get(params.id)
    
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ class: classData })
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/live-classes/[id] - Update class
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const classData = mockClasses.get(params.id)
    
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Update class properties
    const updatedClass = {
      ...classData,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockClasses.set(params.id, updatedClass)

    // If updating meeting details, regenerate meeting link if needed
    if (body.platform && body.autoGenerateLink) {
      if (body.platform === 'zoom') {
        updatedClass.meetingLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
        updatedClass.meetingPassword = Math.random().toString(36).substring(2, 8)
      } else if (body.platform === 'meet') {
        updatedClass.meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
        updatedClass.meetingPassword = ''
      }
    }

    return NextResponse.json({
      message: 'Class updated successfully',
      class: updatedClass
    })
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/live-classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classData = mockClasses.get(params.id)
    
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if class can be deleted (not ongoing)
    if (classData.status === 'ongoing') {
      return NextResponse.json(
        { error: 'Cannot delete ongoing class' },
        { status: 400 }
      )
    }

    // In real app, also cancel meeting in Zoom/Meet
    mockClasses.delete(params.id)

    return NextResponse.json({
      message: 'Class deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}