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

    const { reason } = await request.json()

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
        { error: 'Ticket is already closed' },
        { status: 400 }
      )
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Ticket close error:', updateError)
      throw updateError
    }

    if (reason) {
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: params.id,
          user_id: user.id,
          message: `Ticket closed by user. Reason: ${reason}`,
          is_staff: false,
          is_system: true
        })
    }

    return NextResponse.json({
      ticket: updatedTicket,
      message: 'Ticket closed successfully',
      success: true
    })
  } catch (error) {
    console.error('Ticket close error:', error)
    return NextResponse.json(
      { error: 'Failed to close ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { reason } = await request.json()

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

    if (ticket.status !== 'closed') {
      return NextResponse.json(
        { error: 'Ticket is not closed' },
        { status: 400 }
      )
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({
        status: 'open',
        closed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Ticket reopen error:', updateError)
      throw updateError
    }

    if (reason) {
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: params.id,
          user_id: user.id,
          message: `Ticket reopened by user. Reason: ${reason}`,
          is_staff: false,
          is_system: true
        })
    }

    return NextResponse.json({
      ticket: updatedTicket,
      message: 'Ticket reopened successfully',
      success: true
    })
  } catch (error) {
    console.error('Ticket reopen error:', error)
    return NextResponse.json(
      { error: 'Failed to reopen ticket' },
      { status: 500 }
    )
  }
}
