import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error in GET /api/notifications/stats:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (totalError) {
      console.error('Error fetching total count:', totalError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Get counts by type
    const { data: typeStats, error: typeError } = await supabase
      .from('notifications')
      .select('type')
      .eq('user_id', user.id)

    const typeCounts: Record<string, number> = {}
    if (typeStats) {
      typeStats.forEach((notif: { type: string }) => {
        typeCounts[notif.type] = (typeCounts[notif.type] || 0) + 1
      })
    }

    return NextResponse.json({
      unreadCount: unreadCount || 0,
      totalCount: totalCount || 0,
      typeCounts
    })
  } catch (error) {
    console.error('Error in notifications stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
