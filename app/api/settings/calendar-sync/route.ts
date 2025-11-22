import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Get calendar sync settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's calendar sync settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('calendar_sync_preferences')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      settings: settings?.calendar_sync_preferences || {
        autoSync: true,
        syncOnCreate: true,
        syncOnUpdate: true,
        syncOnDelete: true,
        sendInvites: true,
        includeDescription: true,
        syncReminders: true
      }
    })
  } catch (error) {
    console.error('Error getting calendar sync settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update calendar sync settings
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Upsert user settings
    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        calendar_sync_preferences: body,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Error saving settings:', upsertError)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating calendar sync settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
