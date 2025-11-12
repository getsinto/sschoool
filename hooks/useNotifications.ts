'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationStats, NotificationFilter } from '@/types/notification';
import { NotificationRealtime } from '@/lib/notifications/realtime';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (filter?: NotificationFilter) => {
    if (!user) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter?.type) params.append('type', filter.type);
      if (filter?.read !== undefined) params.append('read', filter.read.toString());
      if (filter?.priority) params.append('priority', filter.priority);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications/stats');
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.unread || 0);
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Delete multiple notifications
  const deleteMultiple = useCallback(async (notificationIds: string[]) => {
    try {
      const promises = notificationIds.map(id => 
        fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      
      const deletedUnreadCount = notifications
        .filter(n => notificationIds.includes(n.id) && !n.read)
        .length;
      
      setNotifications(prev => 
        prev.filter(n => !notificationIds.includes(n.id))
      );
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
    } catch (err) {
      console.error('Error deleting notifications:', err);
    }
  }, [notifications]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    return await NotificationRealtime.requestPermission();
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      await fetch('/api/notifications/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return true;
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      return false;
    }
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    NotificationRealtime.subscribe(user.id);

    // Listen for new notifications
    const unsubscribeNotifications = NotificationRealtime.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Listen for unread count changes
    const unsubscribeCount = NotificationRealtime.onUnreadCountChange((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeCount();
      NotificationRealtime.unsubscribe();
    };
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchStats();
    }
  }, [user, fetchNotifications, fetchStats]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    requestPermission,
    subscribeToPush,
    refresh: () => {
      fetchNotifications();
      fetchStats();
    }
  };
}
