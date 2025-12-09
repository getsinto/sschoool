import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getZoomAccessToken } from '@/lib/zoom/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get access token (will auto-refresh if needed)
    const accessToken = await getZoomAccessToken(user.id)
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Zoom not connected. Please authorize Zoom integration first.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({ access_token: accessToken })
  } catch (error) {
    console.error('Error getting Zoom token:', error)
    return NextResponse.json(
      { error: 'Failed to get Zoom access token' },
      { status: 500 }
    )
  }
}
