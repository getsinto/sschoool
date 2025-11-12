'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  reply_count: number;
}

interface TicketListProps {
  tickets: Ticket[];
  baseUrl?: string;
}

export function TicketList({ tickets, baseUrl = '/support' }: TicketListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
        <p className="text-gray-500">No support tickets match your current filters.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`${baseUrl}/${ticket.id}`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStatusIcon(ticket.status)}
                <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>#{ticket.id.slice(-8)}</span>
                <span className="capitalize">{ticket.category}</span>
                <span>{ticket.reply_count} replies</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
