import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List scheduled reports
export async function GET(request: NextRequest) {
  try {
    const scheduledReports = [
      {
        id: '1',
        reportName: 'Weekly Student Performance',
        frequency: 'weekly',
        recipients: ['admin@example.com'],
        format: 'pdf',
        nextRun: '2024-01-22T09:00:00Z',
        status: 'active'
      },
      {
        id: '2',
        reportName: 'Monthly Financial Summary',
        frequency: 'monthly',
        recipients: ['finance@example.com'],
        format: 'excel',
        nextRun: '2024-02-01T09:00:00Z',
        status: 'active'
      }
    ]

    return NextResponse.json({ scheduledReports })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports' },
      { status: 500 }
    )
  }
}

// POST - Schedule new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportName, frequency, recipients, format } = body

    if (!reportName || !frequency || !recipients) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scheduledReport = {
      id: `schedule_${Date.now()}`,
      reportName,
      frequency,
      recipients,
      format: format || 'pdf',
      status: 'active',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Report scheduled successfully',
      scheduledReport
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to schedule report' },
      { status: 500 }
    )
  }
}
