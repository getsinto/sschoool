import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { ticket_id, assigned_to } = await request.json()

    if (!ticket_id) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (assigned_to) {
      const { data: assignee } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', assigned_to)
        .single()

      if (!assignee || (assignee.role !== 'admin' && assignee.role !== 'teacher')) {
        return NextResponse.json(
          { error: 'Invalid assignee' },
          { status: 400 }
        )
      }
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: assigned_to || null,
        status: assigned_to ? 'in_progress' : 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticket_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Ticket assignment error:', updateError)
      throw updateError
    }

    await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket_id,
        user_id: user.id,
        message: assigned_to 
          ? `Ticket assigned to support staff`
          : `Ticket unassigned`,
        is_staff: true,
        is_system: true
      })

    return NextResponse.json({
      ticket: updatedTicket,
      message: 'Ticket assignment updated successfully',
      success: true
    })
  } catch (error) {
    console.error('Ticket assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign ticket' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { data: staff, error: staffError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['admin', 'teacher'])
      .order('full_name')

    if (staffError) {
      console.error('Staff fetch error:', staffError)
      throw staffError
    }

    const staffWithTickets = await Promise.all(
      (staff || []).map(async (member) => {
        const { count } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .neq('status', 'closed')

        return {
          ...member,
          active_tickets: count || 0
        }
      })
    )

    return NextResponse.json({
      staff: staffWithTickets,
      total: staffWithTickets.length
    })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}
