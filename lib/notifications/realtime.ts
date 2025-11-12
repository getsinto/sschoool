import { createClient } from '@/lib/supabase/client';
import { Notification } from '@/types/notification';
import { RealtimeChannel } from '@supabase/supabase-js';

type NotificationCallback = (notification: Notification) => void;
type UnreadCountCallback = (count: number) => void;

/**
 * Real-time notification service using Supabase Realtime
 */
export class NotificationRealtime {
  private static channel: RealtimeChannel | null = null;
  private static callbacks: NotificationCallback[] = [];
  private static countCallbacks: UnreadCountCallback[] = [];

  /**
   * Subscribe to real-time notifications for a user
   */
  static subscribe(userId: string): void {
    if (this.channel) {
      console.warn('Already subscribed to notifications');
      return;
    }

    const supabase = createClient();

    this.channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          this.handleNewNotification(notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          this.handleNotificationUpdate(notification);
        }
      )
      .subscribe();
  }

  /**
   * Unsubscribe from real-time notifications
   */
  static unsubscribe(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.callbacks = [];
    this.countCallbacks = [];
  }

  /**
   * Add callback for new notifications
   */
  static onNotification(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Add callback for unread count changes
   */
  static onUnreadCountChange(callback: UnreadCountCallback): () => void {
    this.countCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.countCallbacks = this.countCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Handle new notification
   */
  private static handleNewNotification(notification: Notification): void {
    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Play notification sound
    this.playNotificationSound();

    // Show browser notification
    this.showBrowserNotification(notification);

    // Update unread count
    this.updateUnreadCount();
  }

  /**
   * Handle notification update
   */
  private static handleNotificationUpdate(notification: Notification): void {
    // Update unread count if read status changed
    if (notification.read) {
      this.updateUnreadCount();
    }
  }

  /**
   * Play notification sound
   */
  private static playNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Show browser notification
   */
  private static async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          tag: notification.id,
          requireInteraction: notification.priority === 'urgent',
          data: {
            url: notification.action_url
          }
        });

        browserNotification.onclick = () => {
          if (notification.action_url) {
            window.focus();
            window.location.href = notification.action_url;
          }
          browserNotification.close();
        };
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  }

  /**
   * Update unread count
   */
  private static async updateUnreadCount(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/stats');
      const data = await response.json();

      this.countCallbacks.forEach(callback => {
        try {
          callback(data.unread || 0);
        } catch (error) {
          console.error('Error in unread count callback:', error);
        }
      });
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  }

  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }
}

export default NotificationRealtime;
