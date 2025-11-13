import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { subject, description, category, priority, conversationHistory } = await request.json()

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject,
        description,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'open',
        metadata: {
          source: 'chatbot',
          conversationHistory: conversationHistory || []
        }
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to user and support team

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status
      },
      message: 'Support ticket created successfully. Our team will respond shortly.'
    })
  } catch (error) {
    console.error('Escalation API error:', error)
    return NextResponse.json(
      { error: 'Failed to escalate to support' },
      { status: 500 }
    )
  }
}
