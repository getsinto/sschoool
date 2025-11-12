'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { EmailCategory, EmailFrequency } from '@/types/email';

interface NotificationPreferencesProps {
  preferences: Array<{
    category: EmailCategory;
    enabled: boolean;
    frequency: EmailFrequency;
  }>;
  onSave: (preferences: any[]) => Promise<void>;
  saving?: boolean;
}

const categoryLabels: Record<EmailCategory, { title: string; description: string }> = {
  'course-updates': {
    title: 'Course Updates',
    description: 'Notifications about course content and schedule changes'
  },
  'live-class-reminders': {
    title: 'Live Class Reminders',
    description: 'Reminders before your scheduled live classes'
  },
  'assignment-reminders': {
    title: 'Assignment Reminders',
    description: 'Reminders about upcoming assignment deadlines'
  },
  'grade-notifications': {
    title: 'Grade Notifications',
    description: 'Notifications when grades are posted'
  },
  'payment-receipts': {
    title: 'Payment Receipts',
    description: 'Receipts and payment confirmations'
  },
  'announcements': {
    title: 'Announcements',
    description: 'Important announcements from instructors and administrators'
  },
  'messages': {
    title: 'Messages',
    description: 'Direct messages from teachers and staff'
  },
  'marketing': {
    title: 'Marketing & Promotions',
    description: 'News about new courses, features, and special offers'
  }
};

const frequencyOptions = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' },
  { value: 'never', label: 'Never' }
];

export default function NotificationPreferences({
  preferences,
  onSave,
  saving = false
}: NotificationPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (category: EmailCategory) => {
    const updated = localPreferences.map(pref =>
      pref.category === category
        ? { ...pref, enabled: !pref.enabled }
        : pref
    );
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleFrequencyChange = (category: EmailCategory, frequency: EmailFrequency) => {
    const updated = localPreferences.map(pref =>
      pref.category === category
        ? { ...pref, frequency }
        : pref
    );
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          {localPreferences.map((pref) => {
            const info = categoryLabels[pref.category];
            return (
              <div key={pref.category} className="flex items-start justify-between py-4 border-b last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={() => handleToggle(pref.category)}
                    />
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                  {pref.enabled && (
                    <div className="ml-12 mt-2">
                      <label className="text-sm text-gray-600 mr-2">Frequency:</label>
                      <select
                        value={pref.frequency}
                        onChange={(e) => handleFrequencyChange(pref.category, e.target.value as EmailFrequency)}
                        className="border rounded px-3 py-1 text-sm"
                      >
                        {frequencyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {hasChanges && (
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
