'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Bell, Mail, Smartphone, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
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

export default function NotificationSettings() {
  const { requestPermission, subscribeToPush } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
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

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();
      if (response.ok && data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        alert('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePushNotifications = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      const subscribed = await subscribeToPush();
      if (subscribed) {
        setPreferences(prev => ({ ...prev, push_notifications: true }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Delivery Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, email_notifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
            </div>
            {preferences.push_notifications ? (
              <Switch
                checked={true}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, push_notifications: checked }))
                }
              />
            ) : (
              <Button size="sm" onClick={handleEnablePushNotifications}>
                Enable
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
            </div>
            <Switch
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, sms_notifications: checked }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
        <div className="space-y-3">
          {Object.entries(preferences.notification_types).map(([type, enabled]) => (
            <div key={type} className="flex items-center justify-between">
              <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({
                    ...prev,
                    notification_types: {
                      ...prev.notification_types,
                      [type]: checked
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quiet Hours</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Enable Quiet Hours</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={preferences.quiet_hours.start}
                  onChange={(e) =>
                    setPreferences(prev => ({
                      ...prev,
                      quiet_hours: { ...prev.quiet_hours, start: e.target.value }
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={preferences.quiet_hours.end}
                  onChange={(e) =>
                    setPreferences(prev => ({
                      ...prev,
                      quiet_hours: { ...prev.quiet_hours, end: e.target.value }
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
}
