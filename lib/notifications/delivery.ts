import { createClient } from '@/lib/supabase/server';
import { CreateNotificationPayload, DeliveryMethod } from '@/types/notification';
import { generateNotification } from './templates';

/**
 * Notification delivery service
 * Handles creating notifications and delivering them via multiple channels
 */
export class NotificationDelivery {
  /**
   * Create and deliver a notification
   */
  static async send(payload: CreateNotificationPayload): Promise<string | null> {
    try {
      const supabase = createClient();

      // Create notification in database
      const payloadData = payload.data || {};
      const insertResult = await supabase
        .from('notifications')
        .insert({
          user_id: payload.user_id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payloadData,
          priority: payload.priority || 'normal',
          action_url: payload.action_url,
          icon: payload.icon,
          expires_at: payload.expires_at
        } as any)
        .select()
        .single();
      
      const notification = insertResult.data;
      const error = insertResult.error;

      if (error || !notification) {
        console.error('Error creating notification:', error);
        return null;
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(payload.user_id, payload.type);

      // Deliver via enabled channels
      const deliveryPromises: Promise<void>[] = [];
      const notificationId = (notification as any).id;

      if (preferences.in_app_enabled) {
        // In-app notification already created above
        await this.logDelivery(notificationId, 'in_app', 'delivered');
      }

      if (preferences.email_enabled) {
        deliveryPromises.push(this.sendEmail(notification));
      }

      if (preferences.push_enabled) {
        deliveryPromises.push(this.sendPush(notification));
      }

      if (preferences.sms_enabled) {
        deliveryPromises.push(this.sendSMS(notification));
      }

      // Execute all deliveries in parallel
      await Promise.allSettled(deliveryPromises);

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Send notification using template
   */
  static async sendFromTemplate(
    templateKey: string,
    userId: string,
    templateData: any
  ): Promise<string | null> {
    try {
      const notification = generateNotification(templateKey, templateData);
      const notificationPayloadData = notification.data;

      return await this.send({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notificationPayloadData,
        priority: notification.priority,
        action_url: notification.action_url,
        icon: notification.icon
      });
    } catch (error) {
      console.error('Error sending notification from template:', error);
      return null;
    }
  }

  /**
   * Send bulk notifications
   */
  static async sendBulk(
    userIds: string[],
    payload: Omit<CreateNotificationPayload, 'user_id'>
  ): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      const result = await this.send({
        ...payload,
        user_id: userId
      });

      if (result) successCount++;
    }

    return successCount;
  }

  /**
   * Get user notification preferences
   */
  private static async getUserPreferences(userId: string, type: string) {
    const supabase = createClient();

    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', type)
      .single();

    return preferences || {
      in_app_enabled: true,
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false
    };
  }

  /**
   * Send email notification
   */
  private static async sendEmail(notification: any): Promise<void> {
    try {
      // Integrate with email system
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: notification.user_id,
          subject: notification.title,
          template: 'notification',
          templateData: {
            title: notification.title,
            message: notification.message,
            actionUrl: notification.action_url
          }
        })
      });

      await this.logDelivery(notification.id, 'email', 'sent');
    } catch (error) {
      console.error('Error sending email notification:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logDelivery(notification.id, 'email', 'failed', errorMsg);
    }
  }

  /**
   * Send push notification
   */
  private static async sendPush(notification: any): Promise<void> {
    try {
      const pushData = notification.data;
      await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: notification.user_id,
          title: notification.title,
          body: notification.message,
          notificationData: pushData,
          url: notification.action_url
        })
      });

      await this.logDelivery(notification.id, 'push', 'sent');
    } catch (error) {
      console.error('Error sending push notification:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logDelivery(notification.id, 'push', 'failed', errorMsg);
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMS(notification: any): Promise<void> {
    try {
      // Implement SMS sending logic here
      // For now, just log
      console.log('SMS notification:', notification);
      await this.logDelivery(notification.id, 'sms', 'sent');
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logDelivery(notification.id, 'sms', 'failed', errorMsg);
    }
  }

  /**
   * Log delivery attempt
   */
  private static async logDelivery(
    notificationId: string,
    method: DeliveryMethod,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createClient();

    await supabase.from('notification_delivery_log').insert({
      notification_id: notificationId,
      delivery_method: method,
      status,
      error_message: errorMessage
    } as any);
  }
}

// Export both named and default
export const NotificationService = NotificationDelivery;
export default NotificationDelivery;
