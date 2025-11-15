import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch system logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Mock log entries
    const logLevels = ['info', 'warning', 'error', 'debug']
    const logMessages = [
      'User login successful',
      'Payment processed',
      'Email sent',
      'Database connection established',
      'Cache cleared',
      'Backup created',
      'API request failed',
      'File upload completed',
      'Course enrollment processed',
      'Live class started'
    ]

    const mockLogs = Array.from({ length: 100 }, (_, i) => ({
      id: `log_${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      level: logLevels[Math.floor(Math.random() * logLevels.length)],
      message: logMessages[Math.floor(Math.random() * logMessages.length)],
      source: ['api', 'database', 'email', 'payment', 'auth'][Math.floor(Math.random() * 5)],
      userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 100)}` : null,
      metadata: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0...'
      }
    }))

    // Filter by level
    const filteredLogs = level === 'all' 
      ? mockLogs 
      : mockLogs.filter(log => log.level === level)

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit)
      },
      filters: {
        level,
        dateFrom,
        dateTo
      }
    })
  } catch (error) {
    console.error('Logs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

// DELETE - Clear old logs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const olderThan = searchParams.get('olderThan') || '30' // days

    // Mock log deletion
    const deletedCount = Math.floor(Math.random() * 1000) + 100

    return NextResponse.json({
      message: `Logs older than ${olderThan} days deleted successfully`,
      deletedCount
    })
  } catch (error) {
    console.error('Log deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete logs' },
      { status: 500 }
    )
  }
}
