'use client';

import { useState } from 'react';
import { Notification } from '@/types/notification';
import { formatNotificationTime, truncateMessage } from '@/lib/notifications/utils';
import NotificationIcon from './NotificationIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
  compact = false
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const getPriorityBadge = () => {
    if (notification.priority === 'urgent') {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    }
    if (notification.priority === 'high') {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
    }
    return null;
  };

  const content = (
    <div
      className={`
        relative p-4 border-b border-gray-100 transition-colors cursor-pointer
        ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon
            type={notification.type}
            icon={notification.icon}
            priority={notification.priority}
            size={compact ? 16 : 20}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Title and Priority */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                  {notification.title}
                </h4>
                {getPriorityBadge()}
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>

              {/* Message */}
              <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                {compact 
                  ? truncateMessage(notification.message, 60)
                  : truncateMessage(notification.message, 120)
                }
              </p>

              {/* Time */}
              <p className={`text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-xs'}`}>
                {formatNotificationTime(notification.created_at)}
              </p>
            </div>

            {/* Actions */}
            {showActions && isHovered && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {notification.action_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(notification.action_url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.action_url && !isHovered) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
