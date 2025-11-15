import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List saved custom reports
export async function GET(request: NextRequest) {
  try {
    const reports = [
      {
        id: '1',
        name: 'Student Performance Q1',
        dataSource: 'students',
        createdAt: '2024-01-15',
        lastRun: '2024-01-20'
      },
      {
        id: '2',
        name: 'Revenue by Course',
        dataSource: 'financial',
        createdAt: '2024-01-10',
        lastRun: '2024-01-19'
      }
    ]

    return NextResponse.json({ reports })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch custom reports' },
      { status: 500 }
    )
  }
}

// POST - Create new custom report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, dataSource, metrics, dimensions, visualization } = body

    const newReport = {
      id: `report_${Date.now()}`,
      name,
      dataSource,
      metrics,
      dimensions,
      visualization,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Custom report created successfully',
      report: newReport
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create custom report' },
      { status: 500 }
    )
  }
}
