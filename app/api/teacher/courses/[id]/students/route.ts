import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const courseId = params.id

    // TODO: Replace with actual database query
    const mockStudents = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '/avatars/sarah.jpg',
        enrolledAt: '2024-01-15',
        progress: 65,
        lastActivity: '2024-01-20',
        quizAverage: 85,
        completedLessons: 27,
        totalLessons: 42
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        avatar: '/avatars/michael.jpg',
        enrolledAt: '2024-01-14',
        progress: 42,
        lastActivity: '2024-01-19',
        quizAverage: 78,
        completedLessons: 18,
        totalLessons: 42
      },
      {
        id: '3',
        name: 'Emma Davis',
        email: 'emma@example.com',
        avatar: '/avatars/emma.jpg',
        enrolledAt: '2024-01-14',
        progress: 88,
        lastActivity: '2024-01-21',
        quizAverage: 92,
        completedLessons: 37,
        totalLessons: 42
      }
    ]

    return NextResponse.json({
      students: mockStudents,
      total: mockStudents.length
    })
  } catch (error) {
    console.error('Get course students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
