import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notifyStaffNewTicket } from '@/lib/support/notifications'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const {
      conversation_id,
      category,
      priority,
      subject,
      description
    } = await request.json()

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user?.id || null,
        ticket_number: ticketNumber,
        subject: subject.trim(),
        description: description.trim(),
        category: category || 'general',
        priority: priority || 'medium',
        status: 'open',
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      throw ticketError
    }

    // Link conversation to ticket if provided
    if (conversation_id) {
      await supabase
        .from('chat_conversations')
        .update({
          escalated_to_ticket: ticket.id,
          escalated_at: new Date().toISOString()
        })
        .eq('id', conversation_id)

      // Record escalation in analytics
      await supabase
        .from('chatbot_analytics')
        .insert({
          conversation_id,
          query: subject,
          intent: 'escalate',
          escalated: true,
          resolved: false
        })
    }

    // Create initial message with conversation context
    if (conversation_id) {
      // Get recent conversation messages
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversation_id)
        .order('timestamp', { ascending: false })
        .limit(5)

      if (messages && messages.length > 0) {
        const conversationContext = messages
          .reverse()
          .map((m: any) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`)
          .join('\n')

        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticket.id,
            user_id: user?.id || null,
            message: `Escalated from chatbot conversation:\n\n${conversationContext}`,
            is_staff: false,
            is_system: true
          })
      }
    }

    // Notify staff about new ticket
    await notifyStaffNewTicket({
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      userEmail: user?.email || 'Guest User'
    })

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        status: ticket.status
      },
      message: 'Ticket created successfully',
      success: true
    })
  } catch (error) {
    console.error('Escalation error:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}
