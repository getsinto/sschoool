import { createClient } from '@/lib/supabase/server'

interface ZoomTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}

/**
 * Get Zoom access token for a user
 * Automatically refreshes if expired
 */
export async function getZoomAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Get stored tokens
  const { data: tokenData, error } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'zoom')
    .single()
  
  if (error || !tokenData) {
    console.error('No Zoom tokens found for user:', userId)
    return null
  }
  
  // Check if token is expired
  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  
  // If token expires in less than 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newToken = await refreshZoomToken(userId, tokenData.refresh_token)
    return newToken
  }
  
  return tokenData.access_token
}

/**
 * Refresh Zoom access token
 */
async function refreshZoomToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID!
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!
    
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })
    
    if (!response.ok) {
      console.error('Failed to refresh Zoom token')
      return null
    }
    
    const tokenData = await response.json()
    
    // Update tokens in database
    const supabase = await createClient()
    const { error } = await supabase
      .from('integration_tokens')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'zoom')
    
    if (error) {
      console.error('Error updating Zoom tokens:', error)
      return null
    }
    
    return tokenData.access_token
  } catch (error) {
    console.error('Error refreshing Zoom token:', error)
    return null
  }
}

/**
 * Revoke Zoom access (disconnect integration)
 */
export async function revokeZoomAccess(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get current token
    const { data: tokenData } = await supabase
      .from('integration_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'zoom')
      .single()
    
    if (tokenData) {
      // Revoke token with Zoom
      const clientId = process.env.ZOOM_CLIENT_ID!
      const clientSecret = process.env.ZOOM_CLIENT_SECRET!
      
      await fetch('https://zoom.us/oauth/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          token: tokenData.access_token
        })
      })
    }
    
    // Delete from database
    const { error } = await supabase
      .from('integration_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'zoom')
    
    if (error) {
      console.error('Error deleting Zoom tokens:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error revoking Zoom access:', error)
    return false
  }
}

/**
 * Check if user has Zoom connected
 */
export async function isZoomConnected(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('integration_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'zoom')
    .single()
  
  return !error && !!data
}
