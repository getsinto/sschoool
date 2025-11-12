'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';
import { CheckCheck, Eye, Loader2, Bell } from 'lucide-react';
import Link from 'next/link';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Get recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    await markAllAsRead();
    setIsMarkingAllRead(false);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark all read
              </Button>
            )}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={onClose}
              >
                <Eye className="h-3 w-3 mr-1" />
                View all
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              You'll see notifications here when you have updates
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleNotificationClick}
                onDelete={deleteNotification}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
          <Link href="/notifications">
            <Button
              variant="link"
              size="sm"
              className="text-xs text-blue-600"
              onClick={onClose}
            >
              View all {notifications.length} notifications
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
