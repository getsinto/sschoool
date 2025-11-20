import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        context: {
          userRole: 'guest',
          authenticated: false
        }
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get recent activity
    const { data: recentTickets } = await supabase
      .from('support_tickets')
      .select('id, subject, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get enrolled courses (if student)
    let enrolledCourses = []
    if (profile?.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, courses(id, title, status)')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(10)
      
      enrolledCourses = enrollments?.map((e: any) => e.courses) || []
    }

    // Get teaching courses (if teacher)
    let teachingCourses = []
    if (profile?.role === 'teacher') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('teacher_id', user.id)
        .eq('status', 'published')
        .limit(10)
      
      teachingCourses = courses || []
    }

    return NextResponse.json({
      context: {
        userId: user.id,
        userRole: profile?.role || 'student',
        userName: profile?.full_name,
        userEmail: user.email,
        authenticated: true,
        recentTickets: recentTickets || [],
        enrolledCourses,
        teachingCourses,
        preferences: {
          language: profile?.preferred_language || 'en',
          timezone: profile?.timezone || 'UTC'
        }
      }
    })
  } catch (error) {
    console.error('Context fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    )
  }
}
