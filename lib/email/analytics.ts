import { createClient } from '@/lib/supabase/server';
import { EmailAnalytics } from '@/types/email';

/**
 * Email analytics and tracking utility
 */
export class EmailAnalyticsService {
  /**
   * Record email delivery event
   */
  static async recordDelivery(emailJobId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        delivered_at: new Date().toISOString()
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording delivery:', error);
      return false;
    }

    return true;
  }

  /**
   * Record email open event
   */
  static async recordOpen(emailJobId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        opened_at: new Date().toISOString()
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording open:', error);
      return false;
    }

    return true;
  }

  /**
   * Record email click event
   */
  static async recordClick(emailJobId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        clicked_at: new Date().toISOString()
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording click:', error);
      return false;
    }

    return true;
  }

  /**
   * Record email bounce event
   */
  static async recordBounce(
    emailJobId: string,
    bounceType: 'hard' | 'soft',
    reason?: string
  ): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        bounced_at: new Date().toISOString(),
        bounce_type: bounceType,
        bounce_reason: reason
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording bounce:', error);
      return false;
    }

    return true;
  }

  /**
   * Record unsubscribe event
   */
  static async recordUnsubscribe(emailJobId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        unsubscribed_at: new Date().toISOString()
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording unsubscribe:', error);
      return false;
    }

    return true;
  }

  /**
   * Record spam complaint
   */
  static async recordComplaint(emailJobId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('email_analytics')
      .upsert({
        email_job_id: emailJobId,
        complained_at: new Date().toISOString()
      }, {
        onConflict: 'email_job_id'
      });

    if (error) {
      console.error('Error recording complaint:', error);
      return false;
    }

    return true;
  }

  /**
   * Get overall email statistics
   */
  static async getOverallStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
    unsubscribed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }> {
    const supabase = createClient();

    let query = supabase
      .from('email_jobs')
      .select(`
        *,
        email_analytics(*)
      `);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stats:', error);
      return {
        sent: 0, delivered: 0, opened: 0, clicked: 0,
        bounced: 0, complained: 0, unsubscribed: 0,
        deliveryRate: 0, openRate: 0, clickRate: 0, bounceRate: 0
      };
    }

    const stats = {
      sent: data.length,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0
    };

    data.forEach(job => {
      const analytics = job.email_analytics?.[0];
      if (analytics) {
        if (analytics.delivered_at) stats.delivered++;
        if (analytics.opened_at) stats.opened++;
        if (analytics.clicked_at) stats.clicked++;
        if (analytics.bounced_at) stats.bounced++;
        if (analytics.complained_at) stats.complained++;
        if (analytics.unsubscribed_at) stats.unsubscribed++;
      }
    });

    if (stats.sent > 0) {
      stats.deliveryRate = (stats.delivered / stats.sent) * 100;
      stats.bounceRate = (stats.bounced / stats.sent) * 100;
    }
    if (stats.delivered > 0) {
      stats.openRate = (stats.opened / stats.delivered) * 100;
    }
    if (stats.opened > 0) {
      stats.clickRate = (stats.clicked / stats.opened) * 100;
    }

    return stats;
  }

  /**
   * Generate tracking pixel URL for email opens
   */
  static generateTrackingPixel(emailJobId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
    return `${baseUrl}/api/email/track/open?id=${emailJobId}`;
  }

  /**
   * Generate tracked link URL for email clicks
   */
  static generateTrackedLink(emailJobId: string, originalUrl: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${baseUrl}/api/email/track/click?id=${emailJobId}&url=${encodedUrl}`;
  }
}

export default EmailAnalyticsService;
