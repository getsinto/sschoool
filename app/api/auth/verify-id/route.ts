import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const body = await request.json()

    const { userId, verified, adminId } = body

    // Check if the requester is an admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update user verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        is_verified: verified,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    // If verifying a teacher, also approve them
    if (verified) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userProfile?.role === 'teacher') {
        await supabase
          .from('teachers')
          .update({ 
            is_approved: true,
            approval_date: new Date().toISOString(),
          })
          .eq('user_id', userId)
      }
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: verified ? 'Account Verified' : 'Verification Failed',
        message: verified 
          ? 'Your account has been verified and approved. You can now access all features.'
          : 'Your account verification was not approved. Please contact support for more information.',
        type: verified ? 'success' : 'warning',
      })

    return NextResponse.json({
      message: `User ${verified ? 'verified' : 'rejected'} successfully`,
    })
  } catch (error: any) {
    console.error('ID verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    // Check if the requester is an admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get all unverified users
    const { data: unverifiedUsers, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        last_name,
        role,
        id_card_type,
        id_card_url,
        profile_pic,
        created_at,
        teachers (
          qualifications,
          field_of_study,
          experience_years,
          subjects,
          bio
        ),
        students (
          student_type,
          grade_level,
          academic_year,
          english_level
        ),
        parents (
          relationship,
          occupation
        )
      `)
      .eq('is_verified', false)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch unverified users' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users: unverifiedUsers })
  } catch (error: any) {
    console.error('Fetch unverified users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}