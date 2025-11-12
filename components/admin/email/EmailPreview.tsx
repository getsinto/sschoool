'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const templates = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'email-verification', label: 'Email Verification' },
  { value: 'password-reset', label: 'Password Reset' },
  { value: 'enrollment-confirmation', label: 'Enrollment Confirmation' },
  { value: 'payment-receipt', label: 'Payment Receipt' },
  { value: 'live-class-reminder', label: 'Live Class Reminder' },
  { value: 'assignment-due-reminder', label: 'Assignment Due Reminder' },
  { value: 'quiz-available', label: 'Quiz Available' },
  { value: 'grade-posted', label: 'Grade Posted' },
  { value: 'certificate-earned', label: 'Certificate Earned' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'teacher-message', label: 'Teacher Message' },
  { value: 'parent-weekly-report', label: 'Parent Weekly Report' }
];

export default function EmailPreview() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          format: 'html'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.preview);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Email Template Preview</h2>
        <div className="flex gap-3">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
          >
            {templates.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Button onClick={loadPreview} disabled={loading}>
            {loading ? 'Loading...' : 'Preview'}
          </Button>
        </div>
      </div>

      {preview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <iframe
            srcDoc={preview}
            className="w-full h-[600px] bg-white rounded"
            title="Email Preview"
          />
        </div>
      )}
    </Card>
  );
}
