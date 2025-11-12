import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketId = params.id;

    // Verify ticket ownership and status
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id, status')
      .eq('id', ticketId)
      .single();

    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Cannot reply to closed ticket' }, { status: 400 });
    }

    const formData = await request.formData();
    const message = formData.get('message') as string;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const replyId = uuidv4();

    // Create reply
    const { data: reply, error: replyError } = await supabase
      .from('ticket_replies')
      .insert({
        id: replyId,
        ticket_id: ticketId,
        user_id: user.id,
        message: message.trim(),
        is_staff: false
      })
      .select()
      .single();

    if (replyError) {
      console.error('Error creating reply:', replyError);
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
    }

    // Handle file attachments
    const attachmentKeys = Array.from(formData.keys()).filter(key => key.startsWith('attachment_'));
    
    if (attachmentKeys.length > 0) {
      for (const key of attachmentKeys) {
        const file = formData.get(key) as File;
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${ticketId}/${replyId}/${uuidv4()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            await supabase.from('ticket_attachments').insert({
              ticket_id: ticketId,
              reply_id: replyId,
              filename: file.name,
              file_path: fileName,
              file_size: file.size,
              mime_type: file.type
            });
          }
        }
      }
    }

    // Update ticket metadata
    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
        last_reply_at: new Date().toISOString(),
        reply_count: supabase.rpc('increment', { row_id: ticketId })
      })
      .eq('id', ticketId);

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error in reply API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
