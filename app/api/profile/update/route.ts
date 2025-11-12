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

    const {
      profileData,
      notificationSettings,
      privacySettings,
    } = body

    // Update user profile if provided
    if (profileData) {
      const { error: profileError } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }

    // Store notification and privacy settings in user metadata or separate table
    if (notificationSettings || privacySettings) {
      const { error: settingsError } = await supabase.auth.updateUser({
        data: {
          notification_settings: notificationSettings,
          privacy_settings: privacySettings,
        }
      })

      if (settingsError) {
        console.error('Settings update error:', settingsError)
        // Don't fail the request if settings update fails
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Get role-specific profile
    let roleProfile = null
    if (profile?.role === 'teacher') {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (profile?.role === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (profile?.role === 'parent') {
      const { data } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    }

    return NextResponse.json({
      profile,
      roleProfile,
      settings: {
        notifications: user.user_metadata?.notification_settings || {},
        privacy: user.user_metadata?.privacy_settings || {},
      },
    })
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}