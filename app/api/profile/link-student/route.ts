import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const body = await request.json()

    // Get current user (must be a parent)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is a parent
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can link student accounts' },
        { status: 403 }
      )
    }

    const { studentEmail } = body

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      )
    }

    // Find student user by email
    const { data: studentUser, error: studentError } = await supabase
      .from('users')
      .select('id, role, full_name')
      .eq('email', studentEmail)
      .eq('role', 'student')
      .single()

    if (studentError || !studentUser) {
      return NextResponse.json(
        { error: 'Student account not found with this email' },
        { status: 404 }
      )
    }

    // Check if student already has a parent
    const { data: existingLink } = await supabase
      .from('students')
      .select('parent_id')
      .eq('user_id', studentUser.id)
      .single()

    if (existingLink?.parent_id) {
      return NextResponse.json(
        { error: 'This student already has a parent account linked' },
        { status: 400 }
      )
    }

    // Create parent link request
    const { error: requestError } = await supabase
      .from('parent_link_requests')
      .insert({
        student_id: studentUser.id,
        parent_id: user.id,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })

    if (requestError) {
      console.error('Link request error:', requestError)
      return NextResponse.json(
        { error: 'Failed to send link request' },
        { status: 500 }
      )
    }

    // Send notification to student
    await supabase
      .from('notifications')
      .insert({
        user_id: studentUser.id,
        title: 'Parent Link Request',
        message: `A parent has requested to link their account with yours.`,
        type: 'info',
      })

    return NextResponse.json({
      message: 'Student link request sent successfully',
    })
  } catch (error: any) {
    console.error('Link student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
