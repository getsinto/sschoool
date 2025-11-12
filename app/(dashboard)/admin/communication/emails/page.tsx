'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Mail,
  Send,
  FileText,
  Archive,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'

interface Email {
  id: string
  subject: string
  recipients: string[]
  status: 'draft' | 'sent' | 'scheduled'
  sentDate?: string
  scheduledDate?: string
  opens: number
  clicks: number
  createdBy: string
  createdAt: string
}

const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Welcome to St Haroon Online School',
    recipients: ['new_students'],
    status: 'sent',
    sentDate: '2024-01-15',
    opens: 245,
    clicks: 89,
    createdBy: 'Admin User',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    subject: 'Course Enrollment Reminder',
    recipients: ['students', 'parents'],
    status: 'scheduled',
    scheduledDate: '2024-01-20',
    opens: 0,
    clicks: 0,
    createdBy: 'Academic Admin',
    createdAt: '2024-01-14T15:30:00Z'
  }
]

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: emails.length,
    sent: emails.filter(e => e.status === 'sent').length,
    drafts: emails.filter(e => e.status === 'draft').length,
    scheduled: emails.filter(e => e.status === 'scheduled').length,
    totalOpens: emails.reduce((sum, e) => sum + e.opens, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Manage email communications and campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Email
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Opens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOpens}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEmails.map((email) => (
          <Card key={email.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {email.subject}
                    </h3>
                    <Badge className={getStatusColor(email.status)}>
                      {email.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>Recipients: {email.recipients.join(', ')}</span>
                    <span>Opens: {email.opens}</span>
                    <span>Clicks: {email.clicks}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {email.status === 'sent' && email.sentDate && `Sent on ${email.sentDate}`}
                    {email.status === 'scheduled' && email.scheduledDate && `Scheduled for ${email.scheduledDate}`}
                    {email.status === 'draft' && 'Draft - not sent'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmails.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first email campaign to get started'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Email
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}