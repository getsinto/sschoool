'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function BulkEmailSender() {
  const [template, setTemplate] = useState('announcement');
  const [subject, setSubject] = useState('');
  const [segment, setSegment] = useState('all-students');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    try {
      setSending(true);
      setResult(null);

      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          template,
          segment,
          data: {
            campaignName: subject,
            adminId: 'current-admin-id'
          }
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setSubject('');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      setResult({ error: 'Failed to send emails' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Send Bulk Email</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="announcement">Announcement</option>
            <option value="marketing">Marketing</option>
            <option value="course-updates">Course Updates</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter email subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Recipient Segment</label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="all-students">All Students</option>
            <option value="all-teachers">All Teachers</option>
            <option value="all-parents">All Parents</option>
            <option value="active-students">Active Students</option>
          </select>
        </div>

        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full"
        >
          {sending ? 'Sending...' : 'Send Bulk Email'}
        </Button>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success
              ? `Successfully queued ${result.filteredRecipients} emails`
              : result.error || 'Failed to send emails'}
          </Alert>
        )}
      </div>
    </Card>
  );
}
