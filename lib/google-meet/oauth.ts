import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto'

interface GoogleTokenData {
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string
  token_type: string
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Get OAuth2 client instance
 */
function getOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

/**
 * Initiate Google OAuth flow
 * Returns authorization URL with state parameter
 */
export async function initiateGoogleOAuth(userId: string): Promise<string> {
  const oauth2Client = getOAuth2Client()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ]

  // Generate state parameter for CSRF protection
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to always get refresh token
    state: state
  })

  return authUrl
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleGoogleCallback(
  code: string,
  state: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Verify state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'))
    const { userId, timestamp } = stateData
    
    // Check if state is not too old (5 minutes)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return { success: false, error: 'State parameter expired' }
    }

    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return { success: false, error: 'Failed to obtain tokens' }
    }

    // Store tokens in database
    const supabase = await createClient()
    
    // Encrypt tokens before storage
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = encrypt(tokens.refresh_token)
    
    const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600) * 1000).toISOString()

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integration_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'google_meet')
      .single()

    const tokenData = {
      user_id: userId,
      provider: 'google_meet',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: expiresAt,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope || '',
      metadata: {
        expiry_date: tokens.expiry_date
      },
      updated_at: new Date().toISOString()
    }

    if (existing) {
      // Update existing integration
      const { error } = await supabase
        .from('integration_tokens')
        .update(tokenData)
        .eq('id', existing.id)
      
      if (error) {
        console.error('Error updating Google tokens:', error)
        return { success: false, error: 'Failed to store tokens' }
      }
    } else {
      // Create new integration
      const { error } = await supabase
        .from('integration_tokens')
        .insert(tokenData)
      
      if (error) {
        console.error('Error inserting Google tokens:', error)
        return { success: false, error: 'Failed to store tokens' }
      }
    }

    return { success: true, userId }
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'OAuth callback failed' 
    }
  }
}

/**
 * Get Google access token for a user
 * Automatically refreshes if expired
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Get stored tokens
  const { data: tokenData, error } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_meet')
    .single()
  
  if (error || !tokenData) {
    console.error('No Google tokens found for user:', userId)
    return null
  }
  
  // Decrypt tokens
  const accessToken = decrypt(tokenData.access_token)
  const refreshToken = decrypt(tokenData.refresh_token)
  
  // Check if token is expired
  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  
  // If token expires in less than 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newToken = await refreshGoogleToken(userId, refreshToken)
    return newToken
  }
  
  return accessToken
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(
  userId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    
    const { credentials } = await oauth2Client.refreshAccessToken()
    
    if (!credentials.access_token) {
      console.error('Failed to refresh Google token')
      return null
    }
    
    // Update tokens in database
    const supabase = await createClient()
    const encryptedAccessToken = encrypt(credentials.access_token)
    const expiresAt = new Date(credentials.expiry_date || Date.now() + 3600000).toISOString()
    
    const updateData: any = {
      access_token: encryptedAccessToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    }
    
    // Update refresh token if provided
    if (credentials.refresh_token) {
      updateData.refresh_token = encrypt(credentials.refresh_token)
    }
    
    const { error } = await supabase
      .from('integration_tokens')
      .update(updateData)
      .eq('user_id', userId)
      .eq('provider', 'google_meet')
    
    if (error) {
      console.error('Error updating Google tokens:', error)
      return null
    }
    
    return credentials.access_token
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return null
  }
}

/**
 * Revoke Google access (disconnect integration)
 */
export async function revokeGoogleAccess(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get current token
    const { data: tokenData } = await supabase
      .from('integration_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google_meet')
      .single()
    
    if (tokenData) {
      // Decrypt and revoke token with Google
      const accessToken = decrypt(tokenData.access_token)
      
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    }
    
    // Delete from database
    const { error } = await supabase
      .from('integration_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_meet')
    
    if (error) {
      console.error('Error deleting Google tokens:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error revoking Google access:', error)
    return false
  }
}

/**
 * Check if user has Google Meet connected
 */
export async function isGoogleConnected(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('integration_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'google_meet')
    .single()
  
  return !error && !!data
}

/**
 * Get authenticated OAuth2 client for user
 */
export async function getAuthenticatedClient(userId: string): Promise<OAuth2Client | null> {
  const accessToken = await getGoogleAccessToken(userId)
  
  if (!accessToken) {
    return null
  }
  
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  return oauth2Client
}
