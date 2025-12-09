import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAccessToken, isGoogleConnected } from '@/lib/google-meet/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Google is connected
    const connected = await isGoogleConnected(user.id)
    
    if (!connected) {
      return NextResponse.json({ 
        connected: false,
        error: 'Google Meet not connected' 
      }, { status: 404 })
    }

    // Get access token (will auto-refresh if expired)
    try {
      const accessToken = await getGoogleAccessToken(user.id)
      
      return NextResponse.json({ 
        connected: true,
        hasToken: !!accessToken
      })
    } catch (error) {
      console.error('Error getting access token:', error)
      return NextResponse.json({ 
        connected: false,
        error: 'Token refresh failed - please reconnect' 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Error checking Google token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
