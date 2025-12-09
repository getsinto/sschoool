import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeZoomAccess } from '@/lib/zoom/oauth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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
    
    // Revoke Zoom access
    const success = await revokeZoomAccess(user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disconnect Zoom' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Zoom:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Zoom' },
      { status: 500 }
    )
  }
}
