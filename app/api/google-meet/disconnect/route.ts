import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeGoogleAccess } from '@/lib/google-meet/oauth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Revoke Google access and delete tokens
    await revokeGoogleAccess(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google:', error)
    return NextResponse.json({ 
      error: 'Failed to disconnect Google Meet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
