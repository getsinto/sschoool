import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/users/[id]/suspend - Suspend or activate user account
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, reason, adminId, duration } = body
    
    // Validate required fields
    if (!action || !['suspend', 'activate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "suspend" or "activate"' },
        { status: 400 }
      )
    }

    if (action === 'suspend' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required for suspension' },
        { status: 400 }
      )
    }

    // In real app, fetch user from database
    // For now, we'll simulate the suspension process
    
    const newStatus = action === 'suspend' ? 'suspended' : 'active'
    const timestamp = new Date().toISOString()
    
    // Calculate suspension end date if duration is provided
    let suspensionEndDate = null
    if (action === 'suspend' && duration) {
      const endDate = new Date()
      switch (duration) {
        case '1day':
          endDate.setDate(endDate.getDate() + 1)
          break
        case '1week':
          endDate.setDate(endDate.getDate() + 7)
          break
        case '1month':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case '3months':
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case 'permanent':
          // No end date for permanent suspension
          break
        default:
          // Custom duration in days
          const days = parseInt(duration)
          if (!isNaN(days)) {
            endDate.setDate(endDate.getDate() + days)
          }
      }
      
      if (duration !== 'permanent') {
        suspensionEndDate = endDate.toISOString()
      }
    }

    // Create activity log entry
    const logEntry = {
      userId: id,
      action: action === 'suspend' ? 'Account Suspended' : 'Account Activated',
      reason: reason || '',
      adminId,
      adminName: 'Admin User', // In real app, get from adminId
      timestamp,
      suspensionEndDate,
      metadata: {
        duration: duration || null,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    // In real app, update user account status and log the action
    // Also send notification email to user
    
    // Simulate email notification
    const emailData = {
      to: 'user@example.com', // In real app, get user email
      subject: `Account ${action === 'suspend' ? 'Suspended' : 'Activated'}`,
      template: action === 'suspend' ? 'account-suspended' : 'account-activated',
      data: {
        userName: 'User Name', // In real app, get user name
        reason: reason || '',
        suspensionEndDate,
        supportUrl: 'https://example.com/support',
        appealUrl: 'https://example.com/appeal'
      }
    }

    console.log('Account status email would be sent:', emailData)

    // If suspending, also terminate active sessions
    if (action === 'suspend') {
      // In real app, invalidate all user sessions
      console.log(`Terminating all active sessions for user ${id}`)
    }

    return NextResponse.json({
      message: `User account ${action}d successfully`,
      accountStatus: newStatus,
      suspensionEndDate,
      logEntry,
      emailSent: true,
      sessionsTerminated: action === 'suspend'
    })
  } catch (error) {
    console.error('Error processing account status change:', error)
    return NextResponse.json(
      { error: 'Failed to process account status change' },
      { status: 500 }
    )
  }
}

// GET /api/admin/users/[id]/suspend - Get suspension details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch suspension details from database
    const suspensionDetails = {
      userId: id,
      currentStatus: 'active',
      suspensionHistory: [
        {
          id: '1',
          action: 'suspended',
          reason: 'Violation of terms of service',
          startDate: '2024-01-10T00:00:00Z',
          endDate: '2024-01-17T00:00:00Z',
          adminName: 'Admin User',
          adminId: 'admin1',
          duration: '1week',
          resolved: true,
          resolvedDate: '2024-01-17T00:00:00Z'
        }
      ],
      activeSuspension: null, // Current suspension if any
      canAppeal: false,
      appealDeadline: null
    }

    return NextResponse.json({ suspension: suspensionDetails })
  } catch (error) {
    console.error('Error fetching suspension details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suspension details' },
      { status: 500 }
    )
  }
}