import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/lib/email/analytics';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2020); // Far back enough
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get overall stats
    const overall = await EmailAnalyticsService.getOverallStats({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    // Get stats by template
    const byTemplate = await getTemplateStats(startDate, endDate);

    return NextResponse.json({
      overall,
      byTemplate,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        range
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getTemplateStats(startDate: Date, endDate: Date) {
  try {
    const supabase = createClient();

    const { data: jobs, error } = await supabase
      .from('email_jobs')
      .select(`
        template,
        email_analytics(
          delivered_at,
          opened_at,
          clicked_at
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching template stats:', error);
      return [];
    }

    // Group by template
    const templateMap = new Map<string, {
      sent: number;
      opened: number;
      clicked: number;
    }>();

    jobs?.forEach(job => {
      const template = job.template;
      if (!templateMap.has(template)) {
        templateMap.set(template, { sent: 0, opened: 0, clicked: 0 });
      }

      const stats = templateMap.get(template)!;
      stats.sent++;

      const analytics = job.email_analytics?.[0];
      if (analytics) {
        if (analytics.opened_at) stats.opened++;
        if (analytics.clicked_at) stats.clicked++;
      }
    });

    // Convert to array and calculate rates
    return Array.from(templateMap.entries()).map(([template, stats]) => ({
      template,
      sent: stats.sent,
      openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
    })).sort((a, b) => b.sent - a.sent);

  } catch (error) {
    console.error('Error calculating template stats:', error);
    return [];
  }
}
