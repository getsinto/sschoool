import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Update registration status to active
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_status: 'active',
        registration_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve registration' },
        { status: 500 }
      )
    }

    // Send approval email
    try {
      const { sendEmail } = await import('@/lib/email/resend')
      
      await sendEmail({
        to: registration.email,
        subject: 'Registration Approved - St Haroon School',
        template: 'RegistrationApproved',
        data: {
          firstName: registration.first_name,
          userType: registration.role,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
        }
      })
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      message: 'Registration approved successfully',
      registration: {
        ...registration,
        account_status: 'active',
        registration_completed: true
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
