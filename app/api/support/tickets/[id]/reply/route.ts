import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, attachments } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists and user has access
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot reply to closed ticket' },
        { status: 400 }
      )
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        user_id: user.id,
        message: message.trim(),
        is_staff: false,
        attachments: attachments || []
      })
      .select('*')
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      throw messageError
    }

    // Update ticket status to 'open' if it was 'resolved'
    if (ticket.status === 'resolved') {
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
    } else {
      // Just update the updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.id)
    }

    return NextResponse.json({
      message: newMessage,
      success: true
    })
  } catch (error) {
    console.error('Reply creation error:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
