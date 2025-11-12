import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if email already exists in users table
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      console.error('Error checking email:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Email is available if no user was found
    const available = !existingUser

    return NextResponse.json({ available })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}