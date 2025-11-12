// Notification system types

export type NotificationType =
  | 'course'
  | 'assignment'
  | 'quiz'
  | 'grade'
  | 'live_class'
  | 'payment'
  | 'message'
  | 'announcement'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type DeliveryMethod = 'in_app' | 'email' | 'push' | 'sms';

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'delivered';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  read_at?: string;
  action_url?: string;
  icon?: string;
  created_at: string;
  expires_at?: string;
}

export interface UserNotificationPreference {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at: string;
  last_used_at: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notification_id: string;
  delivery_method: DeliveryMethod;
  status: DeliveryStatus;
  error_message?: string;
  delivered_at: string;
}

export interface CreateNotificationPayload {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  action_url?: string;
  icon?: string;
  expires_at?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: (data: any) => string;
  message: (data: any) => string;
  icon: string;
  priority: NotificationPriority;
  action_url?: (data: any) => string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
}
