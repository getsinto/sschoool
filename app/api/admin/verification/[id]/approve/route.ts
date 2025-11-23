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

    const { notes } = await request.json()
    const userId = params.id

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        account_status: 'active',
        is_verified: true,
        verified_at: new Date().toISOString(),
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
        action: 'approved',
        performed_by: user.id,
        notes
      })

    // Send notification to user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Account Verified',
        message: 'Your account has been verified and approved. You can now access all features.',
        type: 'success',
        link_url: '/dashboard'
      })

    return NextResponse.json({
      message: 'User verified successfully',
      success: true
    })
  } catch (error: any) {
    console.error('Error approving verification:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
