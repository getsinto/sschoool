import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { password, reason } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      )
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      )
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    // Check if user has active enrollments or courses
    if (profile?.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('status', 'active')

      if (enrollments && enrollments.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete account with active course enrollments. Please contact support.' },
          { status: 400 }
        )
      }
    }

    if (profile?.role === 'teacher') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('created_by', user.id)
        .eq('is_published', true)

      if (courses && courses.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete account with published courses. Please contact support.' },
          { status: 400 }
        )
      }
    }

    // Log account deletion request
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Account Deletion Requested',
        message: `Account deletion requested. Reason: ${reason || 'Not specified'}`,
        type: 'warning',
      })

    // Instead of immediately deleting, mark account for deletion
    // This allows for a grace period and data recovery if needed
    const { error: deactivateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (deactivateError) {
      return NextResponse.json(
        { error: 'Failed to deactivate account' },
        { status: 500 }
      )
    }

    // Create deletion record for admin review
    await supabase
      .from('account_deletions')
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: profile?.full_name,
        reason: reason,
        requested_at: new Date().toISOString(),
        status: 'pending',
      })
      .then(() => {
        // If table doesn't exist, create it or handle gracefully
        console.log('Account deletion logged')
      })
      .catch((error) => {
        console.error('Failed to log account deletion:', error)
      })

    // Sign out user
    await supabase.auth.signOut()

    return NextResponse.json({
      message: 'Account has been deactivated and marked for deletion. You will receive a confirmation email within 24 hours.',
    })
  } catch (error: any) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()

    // Get current user
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

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get pending account deletions
    const { data: deletions, error } = await supabase
      .from('account_deletions')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch deletion requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ deletions })
  } catch (error: any) {
    console.error('Fetch deletions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}