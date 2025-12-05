import { createClient } from '@/lib/supabase/server';
import { Notification, NotificationPreferences, NotificationDelivery } from './types';
import { sendPushNotification, PushSubscription } from './push';
import { sendEmail } from '@/lib/email/service';

/**
 * Notification Delivery Service
 * Handles multi-channel notification delivery (in-app, email, push, SMS)
 */

export class NotificationDeliveryService {
  /**
   * Deliver notification through all enabled channels
   */
  async deliverNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    const supabase = createClient();

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', notification.type)
      .single();

    // Create in-app notification (always created)
    const { data: inAppNotification, error: inAppError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (inAppError) {
      console.error('Error creating in-app notification:', inAppError);
      return;
    }

    // Track delivery
    await this.trackDelivery(inAppNotification.id, 'in_app', 'delivered');

    // Deliver through other channels based on preferences
    if (preferences?.email_enabled) {
      await this.deliverEmail(userId, notification);
      await this.trackDelivery(inAppNotification.id, 'email', 'sent');
    }

    if (preferences?.push_enabled) {
      await this.deliverPush(userId, notification);
      await this.trackDelivery(inAppNotification.id, 'push', 'sent');
    }

    if (preferences?.sms_enabled) {
      await this.deliverSMS(userId, notification);
      await this.trackDelivery(inAppNotification.id, 'sms', 'sent');
    }
  }

  /**
   * Deliver email notification
   */
  private async deliverEmail(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    try {
      const supabase = createClient();

      // Get user email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('user_id', userId)
        .single();

      if (!profile?.email) {
        console.error('User email not found');
        return;
      }

      // Send email
      await sendEmail({
        to: profile.email,
        subject: notification.title,
        template: 'notification',
        data: {
          name: profile.full_name,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          actionUrl: this.getNotificationActionUrl(notification)
        }
      });
    } catch (error) {
      console.error('Error delivering email notification:', error);
    }
  }

  /**
   * Deliver push notification
   */
  private async deliverPush(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    try {
      const supabase = createClient();

      // Get user push subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) {
        return;
      }

      // Send push notification to all subscriptions
      for (const sub of subscriptions) {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        const success = await sendPushNotification(pushSubscription, {
          title: notification.title,
          body: notification.message,
          data: notification.data,
          tag: notification.type
        });

        // Remove expired subscriptions
        if (!success) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
      }
    } catch (error) {
      console.error('Error delivering push notification:', error);
    }
  }

  /**
   * Deliver SMS notification
   */
  private async deliverSMS(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    try {
      const supabase = createClient();

      // Get user phone number
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('phone')
        .eq('user_id', userId)
        .single();

      if (!profile?.phone) {
        return;
      }

      // TODO: Implement SMS delivery using Twilio or similar service
      console.log('SMS delivery not yet implemented');
    } catch (error) {
      console.error('Error delivering SMS notification:', error);
    }
  }

  /**
   * Track notification delivery
   */
  private async trackDelivery(
    notificationId: string,
    method: 'in_app' | 'email' | 'push' | 'sms',
    status: 'pending' | 'sent' | 'delivered' | 'failed'
  ): Promise<void> {
    try {
      const supabase = createClient();

      await supabase
        .from('notification_delivery')
        .insert({
          notification_id: notificationId,
          delivery_method: method,
          status,
          sent_at: status === 'sent' || status === 'delivered' ? new Date().toISOString() : null,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null
        });
    } catch (error) {
      console.error('Error tracking delivery:', error);
    }
  }

  /**
   * Get action URL for notification
   */
  private getNotificationActionUrl(
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    switch (notification.type) {
      case 'course':
        return `${baseUrl}/courses/${notification.data?.courseId}`;
      case 'assignment':
        return `${baseUrl}/assignments/${notification.data?.assignmentId}`;
      case 'grade':
        return `${baseUrl}/grades`;
      case 'live-class':
        return `${baseUrl}/live-classes/${notification.data?.classId}`;
      case 'payment':
        return `${baseUrl}/payments`;
      case 'message':
        return `${baseUrl}/messages`;
      case 'announcement':
        return `${baseUrl}/announcements/${notification.data?.announcementId}`;
      default:
        return `${baseUrl}/notifications`;
    }
  }

  /**
   * Bulk deliver notifications to multiple users
   */
  async bulkDeliverNotifications(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    await Promise.all(
      userIds.map(userId => this.deliverNotification(userId, notification))
    );
  }

  /**
   * Get delivery statistics for a notification
   */
  async getDeliveryStats(notificationId: string): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    const supabase = createClient();

    const { data: deliveries } = await supabase
      .from('notification_delivery')
      .select('status')
      .eq('notification_id', notificationId);

    if (!deliveries) {
      return { total: 0, delivered: 0, failed: 0, pending: 0 };
    }

    return {
      total: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      pending: deliveries.filter(d => d.status === 'pending').length
    };
  }
}

export const notificationDeliveryService = new NotificationDeliveryService();


/**
 * Helper function to send a notification
 * Convenience wrapper around NotificationDeliveryService
 */
export async function sendNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  return notificationDeliveryService.deliverNotification(userId, notification);
}

/**
 * Helper function to send bulk notifications
 */
export async function sendBulkNotifications(
  userIds: string[],
  notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  return notificationDeliveryService.bulkDeliverNotifications(userIds, notification);
}
