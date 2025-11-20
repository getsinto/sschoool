'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface EscalationFlowProps {
  conversationId?: string
  initialMessage?: string
  onComplete?: (ticketId: string) => void
  onCancel?: () => void
}

export function EscalationFlow({
  conversationId,
  initialMessage = '',
  onComplete,
  onCancel
}: EscalationFlowProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'category' | 'details' | 'confirm'>('category')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: initialMessage
  })

  const categories = [
    { value: 'technical', label: 'Technical Issue', description: 'Problems with the platform or features' },
    { value: 'billing', label: 'Billing & Payments', description: 'Questions about charges or subscriptions' },
    { value: 'academic', label: 'Academic Support', description: 'Course content or learning questions' },
    { value: 'account', label: 'Account Management', description: 'Login, profile, or settings issues' },
    { value: 'general', label: 'General Inquiry', description: 'Other questions or feedback' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', description: 'General question, no urgency' },
    { value: 'medium', label: 'Medium', description: 'Issue affecting my experience' },
    { value: 'high', label: 'High', description: 'Blocking my work or learning' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issue requiring immediate attention' }
  ]

  const handleSubmit = async () => {
    if (!formData.category || !formData.subject || !formData.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/chatbot/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          category: formData.category,
          priority: formData.priority,
          subject: formData.subject,
          description: formData.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Support ticket created',
          description: `Your ticket #${data.ticket.ticket_number} has been created. Our team will respond soon.`
        })
        onComplete?.(data.ticket.id)
      } else {
        throw new Error('Failed to create ticket')
      }
    } catch (error) {
      console.error('Escalation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create support ticket. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">Create Support Ticket</h3>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Let's get you the right help. What type of issue are you experiencing?
          </p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setFormData({ ...formData, category: cat.value })
                  setStep('details')
                }}
                className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                  formData.category === cat.value ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-sm">{cat.label}</div>
                <div className="text-xs text-gray-600 mt-1">{cat.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('category')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Category
          </Button>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Priority Level
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div>
                      <div className="font-medium">{priority.label}</div>
                      <div className="text-xs text-gray-600">{priority.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.subject.length}/200 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Please provide as much detail as possible about your issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep('confirm')}
              disabled={!formData.subject || !formData.description}
              className="flex-1"
            >
              Continue
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('category')}
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Review Your Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium capitalize">{formData.category}</p>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <p className="font-medium capitalize">{formData.priority}</p>
              </div>
              <div>
                <span className="text-gray-600">Subject:</span>
                <p className="font-medium">{formData.subject}</p>
              </div>
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Our support team typically responds within 24 hours. You'll receive email notifications about your ticket status.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('details')}
              disabled={submitting}
            >
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
