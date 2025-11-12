'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationList from '@/components/notifications/NotificationList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    fetchNotifications
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleFilterChange = (filter: any) => {
    fetchNotifications(filter);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Link href="/settings/notifications">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-orange-600">{unreadCount}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-3xl font-bold text-green-600">{readNotifications.length}</p>
            </div>
            <CheckCheck className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList
            notifications={notifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onDeleteMultiple={deleteMultiple}
            onFilterChange={handleFilterChange}
            showFilters={true}
            grouped={true}
          />
        </TabsContent>

        <TabsContent value="unread">
          <NotificationList
            notifications={unreadNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onDeleteMultiple={deleteMultiple}
            onFilterChange={handleFilterChange}
            showFilters={true}
            grouped={true}
          />
        </TabsContent>

        <TabsContent value="read">
          <NotificationList
            notifications={readNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onDeleteMultiple={deleteMultiple}
            onFilterChange={handleFilterChange}
            showFilters={true}
            grouped={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
