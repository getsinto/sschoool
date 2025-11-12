'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Eye, Send } from 'lucide-react';

const templates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to new users upon registration',
    category: 'Transactional',
    status: 'Active'
  },
  {
    id: 'email-verification',
    name: 'Email Verification',
    description: 'Email address verification link',
    category: 'Transactional',
    status: 'Active'
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Password reset instructions',
    category: 'Transactional',
    status: 'Active'
  },
  {
    id: 'enrollment-confirmation',
    name: 'Enrollment Confirmation',
    description: 'Course enrollment confirmation',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    description: 'Payment confirmation and receipt',
    category: 'Transactional',
    status: 'Active'
  },
  {
    id: 'live-class-reminder',
    name: 'Live Class Reminder',
    description: 'Reminder before live classes',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'assignment-due-reminder',
    name: 'Assignment Due Reminder',
    description: 'Assignment deadline reminder',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'quiz-available',
    name: 'Quiz Available',
    description: 'New quiz notification',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'grade-posted',
    name: 'Grade Posted',
    description: 'Grade notification',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'certificate-earned',
    name: 'Certificate Earned',
    description: 'Course completion certificate',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'General announcements',
    category: 'Marketing',
    status: 'Active'
  },
  {
    id: 'teacher-message',
    name: 'Teacher Message',
    description: 'Direct message from teacher',
    category: 'Educational',
    status: 'Active'
  },
  {
    id: 'parent-weekly-report',
    name: 'Parent Weekly Report',
    description: 'Weekly progress report for parents',
    category: 'Educational',
    status: 'Active'
  }
];

export default function EmailTemplateList() {
  const handlePreview = (templateId: string) => {
    window.open(`/admin/email/preview/${templateId}`, '_blank');
  };

  const handleTest = (templateId: string) => {
    // Open test email dialog
    console.log('Test email:', templateId);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Email Templates</h2>

      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <h3 className="font-medium">{template.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(template.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTest(template.id)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
