import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isGoogleConfigured } from '@/lib/google-meet/client'
import { hasGoogleIntegration, getUserGoogleTokens } from '@/lib/google-meet/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Google Meet is configured in environment
    const configured = isGoogleConfigured()

    if (!configured) {
      return NextResponse.json({
        configured: false,
        connected: false,
        integration: null
      })
    }

    // Check if user has Google integration
    const connected = await hasGoogleIntegration(user.id)
    
    let integration = null
    if (connected) {
      const tokens = await getUserGoogleTokens(user.id)
      if (tokens) {
        integration = {
          connected: true,
          scopes: tokens.scope.split(' '),
          expiresAt: new Date(tokens.expiry_date).toISOString()
        }
      }
    }

    return NextResponse.json({
      configured,
      connected,
      integration
    })
  } catch (error) {
    console.error('Error checking Google Meet status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
