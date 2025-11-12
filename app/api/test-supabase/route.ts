import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Test the connection by trying to get the current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || null
    })
  } catch (error: any) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Supabase connection failed',
      error: error.message
    }, { status: 500 })
  }
}