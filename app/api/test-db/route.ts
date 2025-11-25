import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      nodeEnv: process.env.NODE_ENV
    }

    console.log('Environment check:', envCheck)

    // Try to create an admin client (bypasses RLS)
    const supabase = await createAdminClient()
    
    // Try a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        envCheck,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      envCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Test DB error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: {
        message: error?.message,
        type: error?.constructor?.name,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }
    }, { status: 500 })
  }
}
