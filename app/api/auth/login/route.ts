import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password } = loginSchema.parse(body)
    
    const supabase = createClient()
    
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if account is active
    if (user.account_status === 'suspended') {
      return NextResponse.json(
        { error: 'Account suspended. Please contact support.' },
        { status: 403 }
      )
    }
    
    if (user.account_status === 'pending_review') {
      return NextResponse.json(
        { error: 'Account under review. You will be notified once approved.' },
        { status: 403 }
      )
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if email is verified (except for pending verification status)
    if (!user.email_verified && user.account_status !== 'pending_verification') {
      return NextResponse.json(
        { error: 'Email not verified. Please check your email for verification instructions.' },
        { status: 403 }
      )
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
    
    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      userType: user.user_type 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    
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
      message: 'Login successful',
      user: userData,
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}