import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

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

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { error: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Log password change activity
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Password Changed',
        message: 'Your password has been successfully updated.',
        type: 'success',
      })

    return NextResponse.json({
      message: 'Password updated successfully',
    })
  } catch (error: any) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate limiting helper (implement with your preferred solution)
const passwordChangeAttempts = new Map()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 3

  if (!passwordChangeAttempts.has(userId)) {
    passwordChangeAttempts.set(userId, { count: 1, resetTime: now + windowMs })
    return false
  }

  const attempts = passwordChangeAttempts.get(userId)
  
  if (now > attempts.resetTime) {
    passwordChangeAttempts.set(userId, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (attempts.count >= maxAttempts) {
    return true
  }

  attempts.count++
  return false
}