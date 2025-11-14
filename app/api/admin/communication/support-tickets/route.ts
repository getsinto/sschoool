import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const mockTickets = [
  {
    id: '1',
    ticketId: 'TICKET-001',
    subject: 'Cannot access course materials',
    userId: 'user_1',
    userName: 'John Doe',
    userRole: 'student',
    priority: 'high',
    status: 'open',
    assignedTo: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
]

// GET /api/admin/communication/support-tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let filtered = [...mockTickets]

    if (status && status !== 'all') {
      filtered = filtered.filter(t => t.status === status)
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter(t => t.priority === priority)
    }

    return NextResponse.json({ tickets: filtered })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST /api/admin/communication/support-tickets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, userId, priority, description } = body

    if (!subject || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newTicket = {
      id: `ticket_${Date.now()}`,
      ticketId: `TICKET-${String(mockTickets.length + 1).padStart(3, '0')}`,
      subject,
      userId,
      priority: priority || 'medium',
      status: 'open',
      description,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Ticket created successfully',
      ticket: newTicket
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
