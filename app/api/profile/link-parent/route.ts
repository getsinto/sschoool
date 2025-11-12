import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const body = await request.json()

    // Get current user (must be a student)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is a student
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can link parent accounts' },
        { status: 403 }
      )
    }

    const { parentEmail } = body

    if (!parentEmail) {
      return NextResponse.json(
        { error: 'Parent email is required' },
        { status: 400 }
      )
    }

    // Find parent user by email
    const { data: parentUser, error: parentError } = await supabase
      .from('users')
      .select('id, role, full_name')
      .eq('email', parentEmail)
      .eq('role', 'parent')
      .single()

    if (parentError || !parentUser) {
      return NextResponse.json(
        { error: 'Parent account not found with this email' },
        { status: 404 }
      )
    }

    // Check if already linked
    const { data: existingLink } = await supabase
      .from('students')
      .select('parent_id')
      .eq('user_id', user.id)
      .single()

    if (existingLink?.parent_id) {
      return NextResponse.json(
        { error: 'You already have a parent account linked' },
        { status: 400 }
      )
    }

    // Create parent link request
    const { error: requestError } = await supabase
      .from('parent_link_requests')
      .insert({
        student_id: user.id,
        parent_id: parentUser.id,
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

    // Send notification to parent
    await supabase
      .from('notifications')
      .insert({
        user_id: parentUser.id,
        title: 'Parent Link Request',
        message: `A student has requested to link their account with yours.`,
        type: 'info',
      })

    return NextResponse.json({
      message: 'Parent link request sent successfully',
    })
  } catch (error: any) {
    console.error('Link parent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
