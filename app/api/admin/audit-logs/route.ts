import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queryAuditLogs, type AuditLogFilter } from '@/lib/audit/auditLogger';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role_level')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role_level < 4) {
      return NextResponse.json(
        { error: 'Only administrators can view audit logs' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter: AuditLogFilter = {
      action: searchParams.get('action') as any || undefined,
      resourceType: searchParams.get('resourceType') as any || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      userId: searchParams.get('userId') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    };

    // Query audit logs
    const result = await queryAuditLogs(filter);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: result.logs,
      count: result.logs?.length || 0
    });
  } catch (error) {
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
