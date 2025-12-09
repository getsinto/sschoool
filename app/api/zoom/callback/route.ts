import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This should be the user ID
    const error = searchParams.get('error')
    
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=${error}`
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=missing_code`
      )
    }
    
    const supabase = await createClient()
    
    // Verify the state matches the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=invalid_state`
      )
    }
    
    // Exchange authorization code for access token
    const clientId = process.env.ZOOM_CLIENT_ID!
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/zoom/callback`
    
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Zoom token exchange error:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=token_exchange_failed`
      )
    }
    
    const tokenData = await tokenResponse.json()
    
    // Store tokens in database
    const { error: dbError } = await supabase
      .from('integration_tokens')
      .upsert({
        user_id: user.id,
        provider: 'zoom',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        token_type: tokenData.token_type,
        scope: tokenData.scope
      }, {
        onConflict: 'user_id,provider'
      })
    
    if (dbError) {
      console.error('Error storing Zoom tokens:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=storage_failed`
      )
    }
    
    // Redirect back to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?success=true`
    )
  } catch (error) {
    console.error('Zoom callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/teacher/integrations/zoom?error=callback_failed`
    )
  }
}
