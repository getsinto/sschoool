'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Calendar, FileText, DollarSign, Megaphone, MessageSquare, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationPreference {
  category: string;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

const categories = [
  {
    id: 'course-updates',
    name: 'Course Updates',
    description: 'New lessons, course announcements, and content updates',
    icon: <FileText className="h-5 w-5" />,
    transactional: false
  },
  {
    id: 'live-class-reminders',
    name: 'Live Class Reminders',
    description: 'Reminders before scheduled live classes',
    icon: <Calendar className="h-5 w-5" />,
    transactional: true
  },
  {
    id: 'assignment-reminders',
    name: 'Assignment Reminders',
    description: 'Due date reminders for assignments and quizzes',
    icon: <Bell className="h-5 w-5" />,
    transactional: true
  },
  {
    id: 'grade-notifications',
    name: 'Grade Notifications',
    description: 'Notifications when grades are posted',
    icon: <TrendingUp className="h-5 w-5" />,
    transactional: true
  },
  {
    id: 'payment-receipts',
    name: 'Payment Receipts',
    description: 'Receipts and invoices for payments',
    icon: <DollarSign className="h-5 w-5" />,
    transactional: true
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Important platform announcements and updates',
    icon: <Megaphone className="h-5 w-5" />,
    transactional: false
  },
  {
    id: 'messages',
    name: 'Messages',
    description: 'Direct messages from teachers and administrators',
    icon: <MessageSquare className="h-5 w-5" />,
    transactional: true
  },
  {
    id: 'marketing',
    name: 'Marketing & Promotions',
    description: 'New courses, special offers, and newsletters',
    icon: <Mail className="h-5 w-5" />,
    transactional: false
  }
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (category: string, enabled: boolean, frequency?: string) => {
    try {
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          enabled,
          frequency: frequency || 'immediate'
        })
      });

      if (response.ok) {
        setPreferences(prev => {
          const existing = prev.find(p => p.category === category);
          if (existing) {
            return prev.map(p => 
              p.category === category 
                ? { ...p, enabled, frequency: frequency || p.frequency }
                : p
            );
          } else {
            return [...prev, { category, enabled, frequency: frequency || 'immediate' }];
          }
        });

        toast({
          title: 'Success',
          description: 'Notification preferences updated'
        });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      });
    }
  };

  const unsubscribeFromAll = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribeAll: true })
      });

      if (response.ok) {
        await fetchPreferences();
        toast({
          title: 'Success',
          description: 'Unsubscribed from all marketing emails'
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getPreference = (categoryId: string) => {
    return preferences.find(p => p.category === categoryId) || {
      category: categoryId,
      enabled: true,
      frequency: 'immediate'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
        <p className="text-gray-600 mb-6">
          Choose which email notifications you want to receive
        </p>

        <div className="space-y-4">
          {categories.map((category) => {
            const pref = getPreference(category.id);
            
            return (
              <div key={category.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.transactional && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    
                    {pref.enabled && !category.transactional && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-600 mr-2">Frequency:</label>
                        <select
                          value={pref.frequency}
                          onChange={(e) => updatePreference(category.id, true, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={(checked) => updatePreference(category.id, checked)}
                  disabled={category.transactional}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Unsubscribe Section */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-xl font-semibold mb-2 text-red-900">Unsubscribe from All</h2>
        <p className="text-red-700 mb-4">
          Unsubscribe from all marketing and promotional emails. You'll still receive important 
          transactional emails like payment receipts and grade notifications.
        </p>
        <Button 
          variant="destructive" 
          onClick={unsubscribeFromAll}
          disabled={saving}
        >
          {saving ? 'Unsubscribing...' : 'Unsubscribe from All Marketing Emails'}
        </Button>
      </Card>

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">About Email Notifications</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Immediate:</strong> Receive emails as events happen</li>
          <li>• <strong>Daily Digest:</strong> Receive a summary once per day</li>
          <li>• <strong>Weekly Digest:</strong> Receive a summary once per week</li>
          <li>• <strong>Required notifications</strong> cannot be disabled as they contain important information</li>
          <li>• You can change these settings at any time</li>
        </ul>
      </Card>
    </div>
  );
}
