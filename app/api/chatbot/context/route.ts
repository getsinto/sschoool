import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Return guest context
      return NextResponse.json({
        userId: null,
        userName: 'Guest',
        userRole: 'guest',
        currentPage: request.headers.get('referer') || '/',
        enrolledCourses: [],
      })
    }

    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
    }

    // Fetch enrolled courses (if student)
    let enrolledCourses: string[] = []
    if (userData?.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course:courses(title)')
        .eq('student_id', user.id)
        .eq('status', 'active')

      enrolledCourses = enrollments?.map((e: any) => e.course?.title).filter(Boolean) || []
    }

    return NextResponse.json({
      userId: user.id,
      userName: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'User',
      userRole: userData?.role || 'guest',
      userEmail: user.email,
      currentPage: request.headers.get('referer') || '/',
      enrolledCourses,
    })
  } catch (error) {
    console.error('Context API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    )
  }
}
