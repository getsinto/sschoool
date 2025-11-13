import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unread count
    const { count: unread, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (totalError) {
      console.error('Error fetching total count:', totalError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get counts by type
    const { data: byType, error: typeError } = await supabase
      .from('notifications')
      .select('type')
      .eq('user_id', user.id);

    if (typeError) {
      console.error('Error fetching type counts:', typeError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const typeCounts = byType?.reduce((acc: any, n: any) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    // Get counts by priority
    const { data: byPriority, error: priorityError } = await supabase
      .from('notifications')
      .select('priority')
      .eq('user_id', user.id)
      .eq('read', false);

    if (priorityError) {
      console.error('Error fetching priority counts:', priorityError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const priorityCounts = byPriority?.reduce((acc: any, n: any) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      unread: unread || 0,
      total: total || 0,
      by_type: typeCounts || {},
      by_priority: priorityCounts || {}
    });
  } catch (error) {
    console.error('Error in notification stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
