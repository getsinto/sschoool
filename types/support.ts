// Support ticket system types

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'academic' | 'general';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  related_course?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  last_reply_at?: string;
  reply_count: number;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  reply_id?: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface TicketWithDetails extends SupportTicket {
  user?: {
    full_name: string;
    email: string;
  };
  assigned_agent?: {
    full_name: string;
    email: string;
  };
  replies?: TicketReply[];
  attachments?: TicketAttachment[];
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  related_course?: string;
  attachments?: File[];
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  category?: TicketCategory;
}

export interface TicketFilters {
  status?: TicketStatus | 'all';
  category?: TicketCategory | 'all';
  priority?: TicketPriority | 'all';
  assigned?: 'all' | 'unassigned' | 'me';
  search?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_category: Record<TicketCategory, number>;
  by_priority: Record<TicketPriority, number>;
  avg_response_time: number;
  avg_resolution_time: number;
}
