'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  MessageSquare,
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface AdminSupportDetailsPageProps {
  params: {
    id: string
  }
}

export default function AdminSupportDetailsPage({ params }: AdminSupportDetailsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [internalNote, setInternalNote] = useState('')

  useEffect(() => {
    loadTicket()
    loadStaff()
  }, [params.id])

  const loadTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/support/tickets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async () => {
    try {
      const response = await fetch('/api/admin/support/assign')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff || [])
      }
    } catch (error) {
      console.error('Failed to load staff:', error)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${params.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: replyText,
          is_staff: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setReplyText('')
        toast({
          title: 'Reply sent',
          description: 'Your reply has been sent to the user'
        })
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
        toast({
          title: 'Status updated',
          description: `Ticket status changed to ${newStatus}`
        })
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      })
    }
  }

  const handleAssign = async (staffId: string) => {
    try {
      const response = await fetch('/api/admin/support/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket_id: params.id,
          assigned_to: staffId || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
        toast({
          title: 'Assignment updated',
          description: staffId ? 'Ticket assigned successfully' : 'Ticket unassigned'
        })
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign ticket',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-600 mt-4">Loading ticket...</p>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket not found</h3>
          <Button onClick={() => router.push('/admin/support')}>Back to Support</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/support')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Support
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">
                    #{ticket.ticket_number} - {ticket.subject}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Created {formatDistanceToNow(new Date(ticket.created_at))} ago
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`border-l-4 pl-4 ${
                      message.is_staff ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {message.is_staff ? 'Support Team' : 'Customer'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.created_at))} ago
                      </span>
                      {message.is_system && (
                        <Badge variant="outline" className="text-xs">System</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>

              {/* Reply Form */}
              {ticket.status !== 'closed' && (
                <form onSubmit={handleReply} className="space-y-4">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    rows={4}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={sending || !replyText.trim()}>
                      {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select 
                value={ticket.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Assign To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={ticket.assigned_to || 'unassigned'} 
                onValueChange={(value) => handleAssign(value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.active_tickets} active)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium capitalize">{ticket.category}</p>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <p className="font-medium capitalize">{ticket.priority}</p>
              </div>
              <div>
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">{ticket.user_email || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
              {ticket.closed_at && (
                <div>
                  <span className="text-gray-600">Closed:</span>
                  <p className="font-medium">
                    {new Date(ticket.closed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
