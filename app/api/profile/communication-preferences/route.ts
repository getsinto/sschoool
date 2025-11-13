import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
      emailNotifications,
      smsNotifications,
      progressReports,
      assignmentAlerts,
      behaviorReports,
      eventNotifications,
    } = body

    // Store communication preferences in user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        communication_preferences: {
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? false,
          progressReports: progressReports ?? true,
          assignmentAlerts: assignmentAlerts ?? true,
          behaviorReports: behaviorReports ?? true,
          eventNotifications: eventNotifications ?? false,
          updated_at: new Date().toISOString(),
        }
      }
    })

    if (updateError) {
      console.error('Preferences update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update communication preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Communication preferences updated successfully',
    })
  } catch (error: any) {
    console.error('Communication preferences error:', error)
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

    // Get communication preferences from user metadata
    const preferences = user.user_metadata?.communication_preferences || {
      emailNotifications: true,
      smsNotifications: false,
      progressReports: true,
      assignmentAlerts: true,
      behaviorReports: true,
      eventNotifications: false,
    }

    return NextResponse.json({ preferences })
  } catch (error: any) {
    console.error('Fetch preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
