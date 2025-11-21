import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAllLiveClasses } from '@/lib/google-meet/sync'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await syncAllLiveClasses(user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
