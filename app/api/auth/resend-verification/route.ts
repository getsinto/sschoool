import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'If an account exists with this email, a verification link has been sent.'
      })
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({
        message: 'Email is already verified. You can log in now.'
      })
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update profile with new token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_token: verificationToken,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating verification token:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate verification link' },
        { status: 500 }
      )
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email - St Haroon School',
        template: 'EmailVerification',
        data: {
          firstName: profile.first_name,
          verificationUrl,
          expiresIn: '24 hours'
        }
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
