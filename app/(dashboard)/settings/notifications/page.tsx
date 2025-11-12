'use client';

import NotificationSettings from '@/components/notifications/NotificationSettings';
import { Card } from '@/components/ui/card';
import { Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/notifications">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notifications
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Settings */}
      <NotificationSettings />
    </div>
  );
}
