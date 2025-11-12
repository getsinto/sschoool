import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()
    
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get registration details
    const { data: registration, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Update registration status to rejected
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject registration' },
        { status: 500 }
      )
    }

    // Send rejection email
    try {
      const { sendEmail } = await import('@/lib/email/resend')
      
      await sendEmail({
        to: registration.email,
        subject: 'Registration Update - St Haroon School',
        template: 'RegistrationRejected',
        data: {
          firstName: registration.first_name,
          reason: reason.trim(),
          supportEmail: 'support@stharoon.com'
        }
      })
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      message: 'Registration rejected successfully',
      registration: {
        ...registration,
        account_status: 'rejected'
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
