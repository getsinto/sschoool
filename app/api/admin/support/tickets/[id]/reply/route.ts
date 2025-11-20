import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendTicketNotification } from '@/lib/support/notifications'

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
      return NextResponse.json(
        { error: 'Admin or teacher access required' },
        { status: 403 }
      )
    }

    const { message, is_staff = true } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*, profiles!support_tickets_user_id_fkey(email)')
      .eq('id', params.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        user_id: user.id,
        message: message.trim(),
        is_staff: is_staff
      })
      .select('*')
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      throw messageError
    }

    // Update ticket with first response time if this is the first staff reply
    if (is_staff && !ticket.first_response_at) {
      await supabase
        .from('support_tickets')
        .update({
          first_response_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
    } else {
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.id)
    }

    // Send notification to customer
    if (is_staff) {
      await sendTicketNotification({
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        userId: ticket.user_id,
        userEmail: ticket.profiles?.email || '',
        subject: ticket.subject,
        type: 'replied',
        message: message.trim().substring(0, 100)
      })
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
