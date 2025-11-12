import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
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
    
    const users = [
      {
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        name: 'Test Student'
      },
      {
        email: 'teacher@test.com',
        password: 'password123',
        role: 'teacher',
        name: 'Test Teacher'
      },
      {
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
        name: 'Test Parent'
      },
      {
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        name: 'Test Admin'
      }
    ]
    
    const results = []
    
    for (const userData of users) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const userExists = existingUser.users.some(u => u.email === userData.email)
      
      if (userExists) {
        results.push({
          email: userData.email,
          status: 'already_exists'
        })
        continue
      }
      
      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
          user_type: userData.role
        }
      })
      
      if (authError) {
        results.push({
          email: userData.email,
          status: 'error',
          error: authError.message
        })
        continue
      }
      
      results.push({
        email: userData.email,
        role: userData.role,
        status: 'created',
        user_id: authData.user.id
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test users processed',
      results
    })
  } catch (error: any) {
    console.error('Create role users error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
