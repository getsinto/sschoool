'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, MessageSquare, Save, Loader2, Check, Volume2, Moon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission 
} from '@/lib/notifications/push';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_sound: boolean;
  notification_types: {
    course: boolean;
    assignment: boolean;
    quiz: boolean;
    grade: boolean;
    live_class: boolean;
    payment: boolean;
    message: boolean;
    announcement: boolean;
    system: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const notificationTypeLabels = {
  course: { label: 'Course Updates', description: 'New lessons, course updates, and announcements', icon: '📚' },
  assignment: { label: 'Assignments', description: 'New assignments, due dates, and grades', icon: '📝' },
  quiz: { label: 'Quizzes', description: 'New quizzes and results', icon: '🧠' },
  grade: { label: 'Grades', description: 'Grade updates and performance alerts', icon: '📈' },
  live_class: { label: 'Live Classes', description: 'Class reminders and recordings', icon: '🎥' },
  payment: { label: 'Payments', description: 'Payment confirmations and receipts', icon: '💳' },
  message: { label: 'Messages', description: 'Direct messages from teachers and admins', icon: '💬' },
  announcement: { label: 'Announcements', description: 'Important announcements and news', icon: '📢' },
  system: { label: 'System', description: 'Account updates and system notifications', icon: '⚙️' }
};

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    notification_sound: true,
    notification_types: {
      course: true,
      assignment: true,
      quiz: true,
      grade: true,
      live_class: true,
      payment: true,
      message: true,
      announcement: true,
      system: true
    },
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });

  // Load preferences
  useEffect(() => {
    loadPreferences();
    setPushSupported(isPushNotificationSupported());
    setPushPermission(getNotificationPermission());
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (response.ok && data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully',
          variant: 'default'
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      // Enable push notifications
      if (pushPermission !== 'granted') {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        
        if (permission !== 'granted') {
          toast({
            title: 'Permission Denied',
            description: 'Please enable notifications in your browser settings',
            variant: 'destructive'
          });
          return;
        }
      }

      // Subscribe to push
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        // Save subscription to server
        await fetch('/api/notifications/subscribe-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, sendTest: true })
        });

        setPreferences(prev => ({ ...prev, push_notifications: true }));
        toast({
          title: 'Push Notifications Enabled',
          description: 'You will now receive push notifications',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to enable push notifications',
          variant: 'destructive'
        });
      }
    } else {
      // Disable push notifications
      await unsubscribeFromPushNotifications();
      setPreferences(prev => ({ ...prev, push_notifications: false }));
      toast({
        title: 'Push Notifications Disabled',
        description: 'You will no longer receive push notifications',
        variant: 'default'
      });
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings are working correctly.',
          priority: 'normal'
        })
      });

      if (response.ok) {
        toast({
          title: 'Test Notification Sent',
          description: 'Check your notifications to see if it arrived',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Delivery Methods */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Delivery Methods</h2>
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, email_notifications: checked }))
              }
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-600">
                  {pushSupported 
                    ? 'Receive browser push notifications'
                    : 'Not supported in your browser'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.push_notifications}
              onCheckedChange={handlePushToggle}
              disabled={!pushSupported}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <Label className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via SMS (coming soon)</p>
              </div>
            </div>
            <Switch
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, sms_notifications: checked }))
              }
              disabled={true}
            />
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Types</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose which types of notifications you want to receive
        </p>
        <div className="space-y-3">
          {Object.entries(notificationTypeLabels).map(([key, { label, description, icon }]) => (
            <div key={key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <Label className="text-base font-medium">{label}</Label>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <Switch
                checked={preferences.notification_types[key as keyof typeof preferences.notification_types]}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({
                    ...prev,
                    notification_types: {
                      ...prev.notification_types,
                      [key]: checked
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Settings */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Additional Settings</h2>
        <div className="space-y-4">
          {/* Notification Sound */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="text-base font-medium">Notification Sound</Label>
                <p className="text-sm text-gray-600">Play sound when notifications arrive</p>
              </div>
            </div>
            <Switch
              checked={preferences.notification_sound}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, notification_sound: checked }))
              }
            />
          </div>

          {/* Quiet Hours */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-indigo-600" />
                <div>
                  <Label className="text-base font-medium">Do Not Disturb</Label>
                  <p className="text-sm text-gray-600">Mute notifications during specific hours</p>
                </div>
              </div>
              <Switch
                checked={preferences.quiet_hours.enabled}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, enabled: checked }
                  }))
                }
              />
            </div>

            {preferences.quiet_hours.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.start}
                    onChange={(e) => 
                      setPreferences(prev => ({
                        ...prev,
                        quiet_hours: { ...prev.quiet_hours, start: e.target.value }
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-sm">End Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.end}
                    onChange={(e) => 
                      setPreferences(prev => ({
                        ...prev,
                        quiet_hours: { ...prev.quiet_hours, end: e.target.value }
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={sendTestNotification}
        >
          <Bell className="h-4 w-4 mr-2" />
          Send Test Notification
        </Button>

        <Button
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
