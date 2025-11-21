'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      // Create ticket
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create ticket')

      const data = await response.json()
      const ticketId = data.ticket.id

      // Upload attachments if any
      if (attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(file => formData.append('files', file))

        await fetch(`/api/support/tickets/${ticketId}/attachments`, {
          method: 'POST',
          body: formData,
        })
      }

      toast.success(`Ticket #${data.ticket.ticketNumber} created successfully!`)
      router.push(`/student/support/${ticketId}`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/student/support')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Support Ticket</h1>
          <p className="text-gray-600">Describe your issue and we'll help you resolve it</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="billing">Billing & Payments</SelectItem>
              <SelectItem value="academic">Academic Support</SelectItem>
              <SelectItem value="enrollment">Enrollment</SelectItem>
              <SelectItem value="general">General Inquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - General question</SelectItem>
              <SelectItem value="medium">Medium - Need assistance</SelectItem>
              <SelectItem value="high">High - Blocking my work</SelectItem>
              <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            placeholder="Brief description of your issue"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            maxLength={200}
            required
          />
          <p className="text-xs text-gray-500">{formData.subject.length}/200 characters</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide detailed information about your issue..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            maxLength={2000}
            required
          />
          <p className="text-xs text-gray-500">{formData.description.length}/2000 characters</p>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label>Attachments (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setAttachments(files.slice(0, 5))
              }}
              className="w-full"
            />
          </div>
          {attachments.length > 0 && (
            <div className="text-sm text-gray-600">
              {attachments.length} file(s) selected
            </div>
          )}
          <p className="text-xs text-gray-500">
            You can attach up to 5 files (max 10MB each). Supported: images, PDFs, documents
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/student/support')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              'Creating...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Ticket
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Tips for faster resolution:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Be specific about the issue you're experiencing</li>
          <li>Include error messages if applicable</li>
          <li>Mention steps to reproduce the problem</li>
          <li>Attach screenshots or relevant files</li>
          <li>Specify which course or feature is affected</li>
        </ul>
      </div>
    </div>
  )
}
