'use client';

import { useState } from 'react';
import { Notification, NotificationFilter } from '@/types/notification';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, Filter, Trash2 } from 'lucide-react';
import { sortNotifications, groupNotificationsByDate } from '@/lib/notifications/utils';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onFilterChange?: (filter: NotificationFilter) => void;
  showFilters?: boolean;
  grouped?: boolean;
}

export default function NotificationList({
  notifications,
  loading = false,
  onMarkAsRead,
  onDelete,
  onDeleteMultiple,
  onFilterChange,
  showFilters = true,
  grouped = false
}: NotificationListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>({});

  const sortedNotifications = sortNotifications([...notifications]);
  const groupedNotifications = grouped 
    ? groupNotificationsByDate(sortedNotifications)
    : null;

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (onDeleteMultiple && selectedIds.length > 0) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleFilterChange = (key: keyof NotificationFilter, value: any) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="text-sm border border-gray-300 rounded px-3 py-1.5"
              value={filter.read?.toString() || 'all'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
                handleFilterChange('read', value);
              }}
            >
              <option value="all">All notifications</option>
              <option value="false">Unread only</option>
              <option value="true">Read only</option>
            </select>

            <select
              className="text-sm border border-gray-300 rounded px-3 py-1.5"
              value={filter.type || 'all'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? undefined : e.target.value;
                handleFilterChange('type', value);
              }}
            >
              <option value="all">All types</option>
              <option value="course">Course</option>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="grade">Grade</option>
              <option value="live_class">Live Class</option>
              <option value="payment">Payment</option>
              <option value="message">Message</option>
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
            </select>

            <select
              className="text-sm border border-gray-300 rounded px-3 py-1.5"
              value={filter.priority || 'all'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? undefined : e.target.value;
                handleFilterChange('priority', value);
              }}
            >
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No notifications found</p>
        </div>
      ) : grouped && groupedNotifications ? (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-4">
                {date}
              </h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {notifs.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {sortedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
