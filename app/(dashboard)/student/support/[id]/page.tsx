'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SatisfactionSurvey } from '@/components/support/SatisfactionSurvey'
import { ArrowLeft, Send, CheckCircle, Download, Paperclip, User, Clock } from 'lucide-react'
import { SupportTicket, TicketMessage } from '@/types/chatbot'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function TicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)

  useEffect(() => {
    fetchTicketDetails()
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/support/tickets/${ticketId}`)
      const data = await response.json()
      setTicket(data.ticket)
      setMessages(data.messages || [])
      
      // Show survey if ticket is resolved
      if (data.ticket.status === 'resolved' && !data.ticket.satisfactionRating) {
        setShowSurvey(true)
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      setSending(true)

      // Send reply
      const response = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      })

      if (!response.ok) throw new Error('Failed to send reply')

      // Upload attachments if any
      if (attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(file => formData.append('files', file))

        await fetch(`/api/support/tickets/${ticketId}/attachments`, {
          method: 'POST',
          body: formData,
        })
      }

      toast.success('Reply sent successfully')
      setReplyText('')
      setAttachments([])
      fetchTicketDetails()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/close`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to close ticket')

      toast.success('Ticket closed successfully')
      setShowSurvey(true)
      fetchTicketDetails()
    } catch (error) {
      console.error('Error closing ticket:', error)
      toast.error('Failed to close ticket')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      waiting: 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    }
    return colors[status as keyof typeof colors] || colors.open
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading ticket details...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Ticket not found</p>
        <Button onClick={() => router.push('/student/support')}>Back to Tickets</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/student/support')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.ticketNumber}</h1>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
          <p className="text-gray-600">{ticket.subject}</p>
        </div>
        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <Button variant="outline" onClick={handleCloseTicket}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Close Ticket
          </Button>
        )}
      </div>

      {/* Ticket Info */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="font-medium capitalize">{ticket.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-medium">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-medium">{ticket.assignedTo || 'Unassigned'}</p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Conversation</h2>
        </div>
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.userRole === 'admin' ? 'bg-blue-50' : ''} p-4 rounded-lg`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{message.userName}</span>
                    <Badge variant="outline" className="text-xs">
                      {message.userRole}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Paperclip className="h-4 w-4" />
                          {attachment.fileName}
                          <Download className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Label>Add Reply</Label>
          <Textarea
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            maxLength={2000}
          />
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
            {attachments.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                {attachments.length} file(s) selected
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSendReply} disabled={sending || !replyText.trim()}>
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Satisfaction Survey */}
      {showSurvey && ticket && (
        <div className="mt-6">
          <SatisfactionSurvey
            ticketId={ticketId}
            ticketNumber={ticket.ticketNumber}
            onComplete={() => {
              setShowSurvey(false)
              fetchTicketDetails()
            }}
          />
        </div>
      )}
    </div>
  )
}
