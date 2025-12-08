import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }
    
    // Fetch role-specific profile
    let roleProfile = null
    const userType = profile.user_type || profile.role
    
    if (userType === 'teacher') {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (userType === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (userType === 'parent') {
      const { data } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    }
    
    return NextResponse.json({
      profile,
      roleProfile,
      userType
    })
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
