import { NextRequest, NextResponse } from 'next/server'

// Mock data - in real app, this would come from database
const mockUsers = [
  {
    id: '1',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'student',
    registrationDate: '2024-01-15',
    verificationStatus: 'verified',
    accountStatus: 'active',
    lastActive: '2024-01-20'
  },
  {
    id: '2',
    fullName: 'Dr. Michael Brown',
    email: 'michael.brown@email.com',
    role: 'teacher',
    registrationDate: '2024-01-10',
    verificationStatus: 'verified',
    accountStatus: 'active',
    lastActive: '2024-01-19'
  },
  {
    id: '3',
    fullName: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    role: 'parent',
    registrationDate: '2024-01-18',
    verificationStatus: 'pending',
    accountStatus: 'active',
    lastActive: '2024-01-18'
  }
]

// GET /api/admin/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const verification = searchParams.get('verification')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'registrationDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let filteredUsers = [...mockUsers]

    // Apply filters
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.accountStatus === status)
    }

    if (verification && verification !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.verificationStatus === verification)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      },
      filters: {
        role,
        status,
        verification,
        search
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { fullName, email, role, permissions } = body
    
    if (!fullName || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = mockUsers.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      fullName,
      email,
      role,
      registrationDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'verified' as const,
      accountStatus: 'active' as const,
      lastActive: new Date().toISOString().split('T')[0],
      permissions: permissions || []
    }

    // In real app, save to database
    mockUsers.push(newUser)

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}