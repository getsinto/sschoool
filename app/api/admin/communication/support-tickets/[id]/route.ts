import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const mockTickets = new Map([
  ['1', {
    id: '1',
    ticketId: 'TICKET-001',
    subject: 'Cannot access course materials',
    description: 'I am unable to access the course materials for Mathematics Grade 10.',
    userId: 'user_1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userRole: 'student',
    priority: 'high',
    status: 'open',
    assignedTo: null,
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        senderName: 'John Doe',
        content: 'I cannot access the course materials.',
        timestamp: '2024-01-15T10:00:00Z'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }]
])

// GET /api/admin/communication/support-tickets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = mockTickets.get(params.id)
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/communication/support-tickets/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const ticket = mockTickets.get(params.id)
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const updatedTicket = {
      ...ticket,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockTickets.set(params.id, updatedTicket)

    return NextResponse.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
