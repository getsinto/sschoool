import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    
    // Get all users with their details
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        last_name,
        mobile,
        whatsapp,
        role,
        date_of_birth,
        gender,
        country,
        state,
        city,
        address,
        is_verified,
        is_active,
        account_status,
        email_verified,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to fetch users',
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: `Found ${users?.length || 0} users`,
      users: users || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    }, { status: 500 })
  }
}
