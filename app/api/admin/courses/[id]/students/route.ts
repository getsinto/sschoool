import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get course to verify it exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get URL parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'enrolled_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query for enrolled students
    let query = supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        enrolled_at,
        completion_percentage,
        last_accessed_at,
        status,
        user:users (
          id,
          full_name,
          email,
          avatar_url,
          role
        )
      `, { count: 'exact' })
      .eq('course_id', params.id)

    // Apply search filter
    if (search) {
      query = query.ilike('user.full_name', `%${search}%`)
    }

    // Apply sorting
    const sortColumn = sortBy === 'enrolled_date' ? 'enrolled_at' :
                       sortBy === 'progress' ? 'completion_percentage' :
                       sortBy === 'last_accessed' ? 'last_accessed_at' :
                       'enrolled_at'

    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: enrollments, error: enrollmentError, count } = await query

    if (enrollmentError) {
      console.error('Error fetching enrolled students:', enrollmentError)
      return NextResponse.json(
        { error: 'Failed to fetch enrolled students' },
        { status: 500 }
      )
    }

    // Format student data
    const students = enrollments?.map(enrollment => ({
      id: enrollment.user?.id,
      name: enrollment.user?.full_name,
      email: enrollment.user?.email,
      avatar: enrollment.user?.avatar_url,
      enrolledDate: enrollment.enrolled_at,
      progress: enrollment.completion_percentage || 0,
      lastAccessed: enrollment.last_accessed_at,
      status: enrollment.status
    })) || []

    // Calculate statistics
    const totalStudents = count || 0
    const activeStudents = enrollments?.filter(e => e.status === 'active').length || 0
    const completedStudents = enrollments?.filter(e => e.completion_percentage === 100).length || 0
    const avgProgress = enrollments && enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
      : 0

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit)
      },
      statistics: {
        totalStudents,
        activeStudents,
        completedStudents,
        averageProgress: Math.round(avgProgress),
        completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
      }
    })

  } catch (error) {
    console.error('Error in get course students route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
