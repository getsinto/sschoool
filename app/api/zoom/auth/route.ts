import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    // Zoom OAuth 2.0 configuration
    const clientId = process.env.ZOOM_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/zoom/callback`
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Zoom OAuth not configured' },
        { status: 500 }
      )
    }
    
    // Build authorization URL
    const authUrl = new URL('https://zoom.us/oauth/authorize')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('state', user.id) // Use user ID as state for security
    
    // Redirect to Zoom authorization page
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Zoom auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Zoom authorization' },
      { status: 500 }
    )
  }
}
