import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketId = params.id;

    // Fetch ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        assigned_agent:assigned_to(
          full_name,
          email
        )
      `)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (ticketError) {
      console.error('Database error fetching ticket:', ticketError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Fetch replies
    const { data: replies, error: repliesError } = await supabase
      .from('ticket_replies')
      .select(`
        id,
        message,
        created_at,
        is_staff,
        user_id,
        users!ticket_replies_user_id_fkey(full_name)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    }

    // Fetch attachments for replies
    const replyIds = replies?.map(r => r.id) || [];
    let attachments: any[] = [];
    
    if (replyIds.length > 0) {
      const { data: attachmentData } = await supabase
        .from('ticket_attachments')
        .select('*')
        .in('reply_id', replyIds);
      
      attachments = attachmentData || [];
    }

    // Format replies with attachments
    const formattedReplies = replies?.map(reply => ({
      id: reply.id,
      message: reply.message,
      created_at: reply.created_at,
      is_staff: reply.is_staff,
      author_name: reply.users?.full_name || 'Unknown',
      attachments: attachments
        .filter(a => a.reply_id === reply.id)
        .map(a => ({
          id: a.id,
          filename: a.filename,
          file_size: a.file_size,
          file_url: `/api/support/attachments/${a.id}`
        }))
    })) || [];

    const ticketData = {
      ...ticket,
      assigned_agent: ticket.assigned_agent ? {
        name: ticket.assigned_agent.full_name,
        email: ticket.assigned_agent.email
      } : null,
      replies: formattedReplies
    };

    return NextResponse.json({ ticket: ticketData });
  } catch (error) {
    console.error('Error in ticket details API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketId = params.id;
    const body = await request.json();
    const { status } = body;

    // Verify ticket ownership
    const { data: ticket, error: verifyError } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .maybeSingle();

    if (verifyError) {
      console.error('Database error verifying ticket:', verifyError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
    
    if (!updatedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Error in update ticket API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
