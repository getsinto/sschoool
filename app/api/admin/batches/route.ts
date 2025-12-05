/**
 * Admin Batches API
 * Get all batches across the platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/batches
 * Get all batches with course information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Fetch all batches with course information
    const { data: batches, error: batchesError } = await supabase
      .from('course_batches')
      .select(`
        *,
        course:courses(
          id,
          title,
          thumbnail_url
        )
      `)
      .order('start_date', { ascending: false })

    if (batchesError) {
      return NextResponse.json(
        { error: 'Failed to fetch batches' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      batches
    })

  } catch (error) {
    console.error('Admin batches API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
