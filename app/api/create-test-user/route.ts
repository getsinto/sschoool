import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Create admin client directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        user_type: 'student'
      }
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    })
  } catch (error: any) {
    console.error('Create test user error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}