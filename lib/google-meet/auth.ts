// Google Meet OAuth Authentication
// Handles OAuth flow and token management
import { createClient } from '@/lib/supabase/server';
import { getGoogleMeetClient } from './client';

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

/**
 * Initiate OAuth flow
 */
export function initiateGoogleAuth(): string {
  const client = getGoogleMeetClient();
  return client.getAuthUrl();
}

/**
 * Handle OAuth callback and store tokens
 */
export async function handleGoogleCallback(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getGoogleMeetClient();
    const tokens = await client.getTokens(code);
    
    // Store tokens in database
    const supabase = createClient();
    
    // Check if user already has Google integration
    const { data: existing } = await supabase
      .from('user_integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    const integrationData = {
      user_id: userId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: new Date(tokens.expiry_date || Date.now() + 3600000),
      scopes: tokens.scope,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing integration
      await supabase
        .from('user_integrations')
        .update(integrationData)
        .eq('id', existing.id);
    } else {
      // Create new integration
      await supabase
        .from('user_integrations')
        .insert(integrationData);
    }

    return { success: true };
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'OAuth failed' 
    };
  }
}

/**
 * Get user's Google tokens
 */
export async function getUserGoogleTokens(
  userId: string
): Promise<GoogleTokens | null> {
  try {
    const supabase = createClient();
    
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .eq('is_active', true)
      .single();

    if (!integration) {
      return null;
    }

    // Check if token needs refresh
    const now = new Date();
    const expiry = new Date(integration.token_expiry);
    
    if (now >= expiry && integration.refresh_token) {
      // Refresh token
      const client = getGoogleMeetClient();
      const newTokens = await client.refreshAccessToken(integration.refresh_token);
      
      // Update database
      await supabase
        .from('user_integrations')
        .update({
          access_token: newTokens.access_token,
          token_expiry: new Date(newTokens.expiry_date || Date.now() + 3600000),
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);
      
      return newTokens;
    }

    return {
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      scope: integration.scopes,
      token_type: 'Bearer',
      expiry_date: new Date(integration.token_expiry).getTime()
    };
  } catch (error) {
    console.error('Error getting Google tokens:', error);
    return null;
  }
}

/**
 * Check if user has Google integration
 */
export async function hasGoogleIntegration(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('user_integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .eq('is_active', true)
      .single();
    
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Disconnect Google integration
 */
export async function disconnectGoogle(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    await supabase
      .from('user_integrations')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Google:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Disconnect failed' 
    };
  }
}

/**
 * Get authenticated Google client for user
 */
export async function getAuthenticatedClient(userId: string) {
  const tokens = await getUserGoogleTokens(userId);
  
  if (!tokens) {
    throw new Error('No Google integration found');
  }
  
  const client = getGoogleMeetClient();
  client.setCredentials(tokens);
  
  return client;
}
