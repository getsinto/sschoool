import { NextRequest, NextResponse } from 'next/server'

// Mock user details - in real app, this would come from database
const mockUserDetails = {
  '1': {
    id: '1',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    role: 'student',
    registrationDate: '2024-01-15',
    verificationStatus: 'verified',
    accountStatus: 'active',
    lastActive: '2024-01-20',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001'
    },
    idDocuments: {
      front: '/api/placeholder/400/250',
      back: '/api/placeholder/400/250',
      uploadDate: '2024-01-16'
    },
    verificationHistory: [
      {
        date: '2024-01-17',
        action: 'Approved',
        reason: 'All documents verified successfully',
        adminName: 'Admin User'
      }
    ],
    enrolledCourses: [
      {
        id: '1',
        name: 'Mathematics Grade 10',
        enrollmentDate: '2024-01-15',
        progress: 75,
        status: 'active'
      }
    ],
    paymentHistory: [
      {
        id: '1',
        amount: 299,
        date: '2024-01-15',
        description: 'Mathematics Grade 10 - Monthly Subscription',
        status: 'completed'
      }
    ],
    supportTickets: [
      {
        id: '1',
        subject: 'Login Issues',
        status: 'resolved',
        createdDate: '2024-01-19',
        priority: 'medium'
      }
    ],
    activityTimeline: [
      {
        id: '1',
        action: 'Login',
        description: 'User logged in from Chrome browser',
        timestamp: '2024-01-20T10:30:00Z',
        type: 'login'
      }
    ]
  }
}

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch from database
    const user = mockUserDetails[id as keyof typeof mockUserDetails]
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // In real app, fetch from database
    const user = mockUserDetails[id as keyof typeof mockUserDetails]
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user fields
    const updatedUser = {
      ...user,
      ...body,
      id // Ensure ID cannot be changed
    }

    // In real app, save to database
    mockUserDetails[id as keyof typeof mockUserDetails] = updatedUser

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')
    
    // In real app, fetch from database
    const user = mockUserDetails[id as keyof typeof mockUserDetails]
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Deletion reason is required' },
        { status: 400 }
      )
    }

    // In real app, soft delete or hard delete based on requirements
    // For now, we'll just remove from mock data
    delete mockUserDetails[id as keyof typeof mockUserDetails]

    // Log the deletion
    console.log(`User ${id} deleted. Reason: ${reason}`)

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}