import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy')
    const search = searchParams.get('search')

    // TODO: Replace with actual database query
    // For now, return mock data
    const mockCourses = [
      {
        id: '1',
        title: 'Advanced Mathematics',
        thumbnail: '/course-thumbnails/math.jpg',
        category: 'Mathematics',
        grade: 'Grade 10',
        subject: 'Algebra',
        enrollments: 245,
        rating: 4.8,
        revenue: 12450,
        status: 'published',
        lastUpdated: '2024-01-10',
        createdAt: '2023-09-01'
      },
      {
        id: '2',
        title: 'Physics Fundamentals',
        thumbnail: '/course-thumbnails/physics.jpg',
        category: 'Science',
        grade: 'Grade 9',
        subject: 'Physics',
        enrollments: 189,
        rating: 4.6,
        revenue: 9450,
        status: 'published',
        lastUpdated: '2024-01-08',
        createdAt: '2023-08-15'
      },
      {
        id: '3',
        title: 'English Literature',
        thumbnail: '/course-thumbnails/english.jpg',
        category: 'Language',
        grade: 'Grade 8',
        subject: 'English',
        enrollments: 312,
        rating: 4.9,
        revenue: 15600,
        status: 'published',
        lastUpdated: '2024-01-12',
        createdAt: '2023-10-01'
      },
      {
        id: '4',
        title: 'Chemistry Basics',
        thumbnail: '/course-thumbnails/chemistry.jpg',
        category: 'Science',
        grade: 'Grade 9',
        subject: 'Chemistry',
        enrollments: 156,
        rating: 4.5,
        revenue: 7800,
        status: 'draft',
        lastUpdated: '2024-01-05',
        createdAt: '2024-01-01'
      }
    ]

    // Filter by status if provided
    let filteredCourses = mockCourses
    if (status && status !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.status === status)
    }

    // Filter by search query if provided
    if (search) {
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort courses
    if (sortBy) {
      switch (sortBy) {
        case 'newest':
          filteredCourses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'popular':
          filteredCourses.sort((a, b) => b.rating - a.rating)
          break
        case 'enrolled':
          filteredCourses.sort((a, b) => b.enrollments - a.enrollments)
          break
        case 'updated':
          filteredCourses.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          break
      }
    }

    return NextResponse.json({
      courses: filteredCourses,
      total: filteredCourses.length
    })
  } catch (error) {
    console.error('Teacher courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // TODO: Implement course creation logic
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      courseId: 'new-course-id'
    }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
