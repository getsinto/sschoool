import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({
        session: null,
        user: null,
      })
    }

    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET) as any
    const userId = payload.userId as string

    const supabase = createClient()

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      // Invalid token, clear cookie
      const response = NextResponse.json({
        session: null,
        user: null,
      })
      response.cookies.delete('auth-token')
      return response
    }

    // Return user data (without sensitive info)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      role: user.user_type, // For compatibility
      accountStatus: user.account_status,
      emailVerified: user.email_verified,
      profilePhotoUrl: user.profile_photo_url,
    }

    return NextResponse.json({
      session: { user: userData },
      user: userData,
    })
  } catch (error: any) {
    console.error('Session error:', error)
    // Invalid token, clear cookie
    const response = NextResponse.json({
      session: null,
      user: null,
    })
    response.cookies.delete('auth-token')
    return response
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (error: any) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}