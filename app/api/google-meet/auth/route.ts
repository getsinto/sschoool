import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateGoogleOAuth } from '@/lib/google-meet/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate OAuth URL with user ID in state
    const authUrl = await initiateGoogleOAuth(user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 })
  }
}
