import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Resend } from 'resend'
import UserCredentialsEmail from '@/emails/UserCredentials'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema
const sendCredentialsSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  userName: z.string().min(1),
  temporaryPassword: z.string().min(8),
  userRole: z.enum(['student', 'teacher', 'parent', 'admin']),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // 3. Parse and validate request body
    const body = await request.json()
    const validatedData = sendCredentialsSchema.parse(body)

    // 4. Verify the user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', validatedData.userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 5. Verify email matches
    if (targetUser.email !== validatedData.userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email mismatch' },
        { status: 400 }
      )
    }

    // 6. Get login URL based on environment
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : 'https://st-haroon-online-school.vercel.app/login'

    // 7. Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'St. Haroon Online School <noreply@st-haroon.com>',
      to: validatedData.userEmail,
      subject: 'Your Account Credentials - St. Haroon Online School',
      react: UserCredentialsEmail({
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        temporaryPassword: validatedData.temporaryPassword,
        userRole: validatedData.userRole,
        loginUrl,
      }),
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      
      // Log the failure but don't expose email service details
      await supabase.rpc('log_user_creation_failure', {
        p_admin_id: user.id,
        p_user_type: validatedData.userRole,
        p_email: validatedData.userEmail,
        p_error_message: 'Failed to send credentials email',
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email. Please try again or contact support.',
        },
        { status: 500 }
      )
    }

    // 8. Log successful email send
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'send_user_credentials',
      resource_type: 'user',
      resource_id: validatedData.userId,
      details: {
        recipient_email: validatedData.userEmail,
        user_role: validatedData.userRole,
        email_id: emailData?.id,
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json({
      success: true,
      message: 'Credentials email sent successfully',
      emailId: emailData?.id,
    })
  } catch (error) {
    console.error('Send credentials error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
