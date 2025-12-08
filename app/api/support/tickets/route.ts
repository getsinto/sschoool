import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('support_tickets')
      .select(`
        id,
        subject,
        category,
        priority,
        status,
        created_at,
        updated_at,
        last_reply_at,
        reply_count
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error) {
    console.error('Error in tickets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const description = formData.get('description') as string;
    const related_course = formData.get('related_course') as string;

    if (!subject || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticketId = uuidv4();

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        id: ticketId,
        user_id: user.id,
        subject,
        category,
        priority: priority || 'medium',
        description,
        related_course: related_course || null,
        status: 'open',
        reply_count: 0
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Handle file attachments if any
    const attachmentKeys = Array.from(formData.keys()).filter(key => key.startsWith('attachment_'));
    
    if (attachmentKeys.length > 0) {
      for (const key of attachmentKeys) {
        const file = formData.get(key) as File;
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${ticketId}/${uuidv4()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            await supabase.from('ticket_attachments').insert({
              ticket_id: ticketId,
              reply_id: null,
              filename: file.name,
              file_path: fileName,
              file_size: file.size,
              mime_type: file.type
            });
          }
        }
      }
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Error in create ticket API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
