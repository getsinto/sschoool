import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/users/[id]/verify - Approve or reject user verification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, reason, adminId } = body
    
    // Validate required fields
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required for rejection' },
        { status: 400 }
      )
    }

    // In real app, fetch user from database
    // For now, we'll simulate the verification process
    
    const verificationStatus = action === 'approve' ? 'verified' : 'rejected'
    const timestamp = new Date().toISOString()
    
    // Create verification history entry
    const historyEntry = {
      date: timestamp.split('T')[0],
      action: action === 'approve' ? 'Approved' : 'Rejected',
      reason: reason || (action === 'approve' ? 'All documents verified successfully' : ''),
      adminName: 'Admin User', // In real app, get from adminId
      adminId
    }

    // In real app, update user verification status and add to history
    // Also send notification email to user
    
    // Simulate email notification
    const emailData = {
      to: 'user@example.com', // In real app, get user email
      subject: `ID Verification ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      template: action === 'approve' ? 'verification-approved' : 'verification-rejected',
      data: {
        userName: 'User Name', // In real app, get user name
        reason: reason || '',
        supportUrl: 'https://example.com/support'
      }
    }

    console.log('Verification email would be sent:', emailData)

    return NextResponse.json({
      message: `User verification ${action}d successfully`,
      verificationStatus,
      historyEntry,
      emailSent: true
    })
  } catch (error) {
    console.error('Error processing verification:', error)
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    )
  }
}

// GET /api/admin/users/[id]/verify - Get verification details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch verification details from database
    const verificationDetails = {
      userId: id,
      status: 'pending',
      documents: {
        front: '/api/placeholder/400/250',
        back: '/api/placeholder/400/250',
        uploadDate: '2024-01-16T10:30:00Z'
      },
      history: [
        {
          date: '2024-01-16',
          action: 'Submitted',
          adminName: 'System'
        }
      ],
      metadata: {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        uploadSource: 'web'
      }
    }

    return NextResponse.json({ verification: verificationDetails })
  } catch (error) {
    console.error('Error fetching verification details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification details' },
      { status: 500 }
    )
  }
}