import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()

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
        { error: 'Only students can unlink parent accounts' },
        { status: 403 }
      )
    }

    // Get current parent link
    const { data: studentProfile } = await supabase
      .from('students')
      .select('parent_id')
      .eq('user_id', user.id)
      .single()

    if (!studentProfile?.parent_id) {
      return NextResponse.json(
        { error: 'No parent account is currently linked' },
        { status: 400 }
      )
    }

    // Unlink parent
    const { error: unlinkError } = await supabase
      .from('students')
      .update({
        parent_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (unlinkError) {
      console.error('Unlink error:', unlinkError)
      return NextResponse.json(
        { error: 'Failed to unlink parent account' },
        { status: 500 }
      )
    }

    // Send notification to parent
    await supabase
      .from('notifications')
      .insert({
        user_id: studentProfile.parent_id,
        title: 'Student Account Unlinked',
        message: `A student has unlinked their account from yours.`,
        type: 'info',
      })

    return NextResponse.json({
      message: 'Parent account unlinked successfully',
    })
  } catch (error: any) {
    console.error('Unlink parent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
