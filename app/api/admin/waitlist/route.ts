/**
 * Admin Waitlist API
 * Get all waitlist entries across the platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/waitlist
 * Get all waitlist entries with student and course information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication and admin role
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
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all waitlist entries with related data
    const { data: waitlist, error: waitlistError } = await supabase
      .from('course_waitlist')
      .select(`
        *,
        course:courses(
          id,
          title,
          thumbnail_url
        ),
        batch:course_batches(
          batch_name
        ),
        student:users!course_waitlist_student_id_fkey(
          full_name,
          email
        )
      `)
      .order('joined_waitlist_at', { ascending: false })

    if (waitlistError) {
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      waitlist
    })

  } catch (error) {
    console.error('Admin waitlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
