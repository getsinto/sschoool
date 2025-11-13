import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/export - Export users to CSV/Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const format = searchParams.get('format') || 'csv'
    const userIds = searchParams.get('userIds')?.split(',') || []
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const verification = searchParams.get('verification')
    const includePersonalData = searchParams.get('includePersonalData') === 'true'
    const includePaymentData = searchParams.get('includePaymentData') === 'true'
    
    // Validate format
    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv, excel, or json' },
        { status: 400 }
      )
    }

    // In real app, fetch users from database based on filters
    const mockUsers = [
      {
        id: '1',
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        role: 'student',
        registrationDate: '2024-01-15',
        verificationStatus: 'verified',
        accountStatus: 'active',
        lastActive: '2024-01-20',
        address: includePersonalData ? '123 Main St, New York, NY 10001' : '[REDACTED]',
        totalPayments: includePaymentData ? 548 : '[REDACTED]',
        coursesEnrolled: 2
      },
      {
        id: '2',
        fullName: 'Dr. Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1 (555) 234-5678',
        role: 'teacher',
        registrationDate: '2024-01-10',
        verificationStatus: 'verified',
        accountStatus: 'active',
        lastActive: '2024-01-19',
        address: includePersonalData ? '456 Oak Ave, Boston, MA 02101' : '[REDACTED]',
        totalPayments: includePaymentData ? 0 : '[REDACTED]',
        coursesCreated: 5
      }
    ]

    // Apply filters
    let filteredUsers = mockUsers

    if (userIds.length > 0) {
      filteredUsers = filteredUsers.filter(user => userIds.includes(user.id))
    }

    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.accountStatus === status)
    }

    if (verification && verification !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.verificationStatus === verification)
    }

    // Generate export data based on format
    let exportData: string | Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case 'csv':
        exportData = generateCSV(filteredUsers)
        contentType = 'text/csv'
        filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`
        break
        
      case 'excel':
        // In real app, use a library like xlsx to generate Excel files
        exportData = generateCSV(filteredUsers) // Simplified for demo
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`
        break
        
      case 'json':
        exportData = JSON.stringify(filteredUsers, null, 2)
        contentType = 'application/json'
        filename = `users_export_${new Date().toISOString().split('T')[0]}.json`
        break
        
      default:
        throw new Error('Unsupported format')
    }

    // Log export activity
    const exportLog = {
      id: `export_${Date.now()}`,
      format,
      userCount: filteredUsers.length,
      filters: { role, status, verification },
      includePersonalData,
      includePaymentData,
      adminId: 'admin1', // In real app, get from session
      adminName: 'Admin User',
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    }

    console.log('User export log:', exportLog)

    // Return file download
    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(exportData).toString()
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}

// Helper function to generate CSV
function generateCSV(users: any[]): string {
  if (users.length === 0) {
    return 'No data to export'
  }

  // Get headers from first user object
  const headers = Object.keys(users[0])
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...users.map(user => 
      headers.map(header => {
        const value = user[header]
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  return csvRows.join('\n')
}

// POST /api/admin/users/export - Queue export job for large datasets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      format, 
      filters, 
      includePersonalData, 
      includePaymentData, 
      adminId,
      notificationEmail 
    } = body

    // For large datasets, queue the export job
    const exportJob = {
      id: `job_${Date.now()}`,
      format,
      filters,
      includePersonalData,
      includePaymentData,
      adminId,
      notificationEmail,
      status: 'queued',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    }

    // In real app, add to job queue (Redis, Bull, etc.)
    console.log('Export job queued:', exportJob)

    // Send confirmation email
    if (notificationEmail) {
      console.log(`Export completion notification will be sent to: ${notificationEmail}`)
    }

    return NextResponse.json({
      message: 'Export job queued successfully',
      jobId: exportJob.id,
      estimatedCompletion: exportJob.estimatedCompletion,
      status: 'queued'
    })
  } catch (error) {
    console.error('Error queuing export job:', error)
    return NextResponse.json(
      { error: 'Failed to queue export job' },
      { status: 500 }
    )
  }
}