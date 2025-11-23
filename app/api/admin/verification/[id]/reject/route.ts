import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { reason, notes } = await request.json()
    const userId = params.id

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        account_status: 'rejected',
        rejection_reason: reason,
        verified_by: user.id
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Add to verification history
    await supabase
      .from('verification_history')
      .insert({
        user_id: userId,
        action: 'rejected',
        performed_by: user.id,
        reason,
        notes
      })

    // Send notification to user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Account Verification Rejected',
        message: `Your account verification was not approved. Reason: ${reason}`,
        type: 'error',
        link_url: '/support'
      })

    return NextResponse.json({
      message: 'User verification rejected',
      success: true
    })
  } catch (error: any) {
    console.error('Error rejecting verification:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
