import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
        { error: 'Only parents can unlink student accounts' },
        { status: 403 }
      )
    }

    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Verify the student is linked to this parent
    const { data: studentProfile } = await supabase
      .from('students')
      .select('parent_id')
      .eq('user_id', studentId)
      .single()

    if (!studentProfile || studentProfile.parent_id !== user.id) {
      return NextResponse.json(
        { error: 'This student is not linked to your account' },
        { status: 403 }
      )
    }

    // Unlink student
    const { error: unlinkError } = await supabase
      .from('students')
      .update({
        parent_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', studentId)

    if (unlinkError) {
      console.error('Unlink error:', unlinkError)
      return NextResponse.json(
        { error: 'Failed to unlink student account' },
        { status: 500 }
      )
    }

    // Send notification to student
    await supabase
      .from('notifications')
      .insert({
        user_id: studentId,
        title: 'Parent Account Unlinked',
        message: `Your parent has unlinked their account from yours.`,
        type: 'info',
      })

    return NextResponse.json({
      message: 'Student account unlinked successfully',
    })
  } catch (error: any) {
    console.error('Unlink student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
