import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_token', request.url)
      )
    }

    const supabase = createClient()

    // Find user with this verification token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (profileError || !profile) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_token', request.url)
      )
    }

    // Check if token has expired
    const tokenExpiresAt = new Date(profile.token_expires_at)
    const now = new Date()

    if (tokenExpiresAt < now) {
      return NextResponse.redirect(
        new URL('/auth/login?error=token_expired', request.url)
      )
    }

    // Update profile to mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        account_status: profile.role === 'teacher' ? 'pending_review' : 'active',
        verification_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.redirect(
        new URL('/auth/login?error=verification_failed', request.url)
      )
    }

    // Update auth user metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(
      profile.id,
      {
        email_confirm: true,
        user_metadata: {
          ...profile,
          email_verified: true
        }
      }
    )

    if (authError) {
      console.error('Error updating auth user:', authError)
    }

    // Redirect based on user role
    if (profile.role === 'teacher') {
      return NextResponse.redirect(
        new URL('/auth/login?verified=true&message=pending_review', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/auth/login?verified=true', request.url)
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=verification_failed', request.url)
    )
  }
}
