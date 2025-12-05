/**
 * Course Permissions Monitoring API
 * Task 25: Create monitoring and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getMetricsSummary,
  checkAlerts,
  getMetrics,
  METRICS
} from '@/lib/monitoring/coursePermissionsMetrics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24');
    const action = searchParams.get('action') || 'summary';

    if (action === 'summary') {
      // Get metrics summary
      const summary = await getMetricsSummary(hours);
      
      return NextResponse.json({
        success: true,
        data: summary,
        timeRange: {
          hours,
          from: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      });
    }

    if (action === 'alerts') {
      // Check for active alerts
      const alerts = await checkAlerts(hours);
      
      return NextResponse.json({
        success: true,
        data: {
          alerts: alerts.map(a => ({
            name: a.alert.name,
            severity: a.alert.severity,
            message: a.alert.message,
            metricCount: a.metrics.length
          })),
          hasAlerts: alerts.length > 0
        }
      });
    }

    if (action === 'details') {
      // Get detailed metrics for a specific metric name
      const metricName = searchParams.get('metric');
      if (!metricName) {
        return NextResponse.json(
          { error: 'Metric name required for details action' },
          { status: 400 }
        );
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
      const metrics = await getMetrics(metricName, startTime, endTime);

      return NextResponse.json({
        success: true,
        data: {
          metricName,
          metrics,
          count: metrics.length
        }
      });
    }

    if (action === 'available-metrics') {
      // Return list of available metrics
      return NextResponse.json({
        success: true,
        data: {
          metrics: Object.entries(METRICS).map(([key, value]) => ({
            key,
            name: value
          }))
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
