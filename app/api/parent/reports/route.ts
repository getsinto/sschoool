import { NextRequest, NextResponse } from 'next/server'

// GET /api/parent/reports - Get list of generated reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const type = searchParams.get('type') // weekly, monthly, semester, custom

    // Mock reports data - replace with actual database queries
    const reports = [
      {
        id: 'report_1',
        childId: 'child_1',
        childName: 'Alice Johnson',
        type: 'weekly',
        title: 'Weekly Progress Report - Week of Jan 15',
        period: {
          start: '2024-01-15',
          end: '2024-01-21'
        },
        generatedAt: '2024-01-21T18:00:00Z',
        status: 'completed',
        fileUrl: '/reports/report_1.pdf',
        fileSize: '2.4 MB',
        sections: {
          performance: true,
          attendance: true,
          behavior: true,
          teacherComments: true,
          recommendations: true
        },
        summary: {
          overallGrade: 88,
          attendanceRate: 95,
          assignmentsCompleted: 12,
          behaviorScore: 'Excellent'
        }
      },
      {
        id: 'report_2',
        childId: 'child_2',
        childName: 'Bob Johnson',
        type: 'weekly',
        title: 'Weekly Progress Report - Week of Jan 15',
        period: {
          start: '2024-01-15',
          end: '2024-01-21'
        },
        generatedAt: '2024-01-21T18:00:00Z',
        status: 'completed',
        fileUrl: '/reports/report_2.pdf',
        fileSize: '2.1 MB',
        sections: {
          performance: true,
          attendance: true,
          behavior: true,
          teacherComments: true,
          recommendations: true
        },
        summary: {
          overallGrade: 78,
          attendanceRate: 88,
          assignmentsCompleted: 8,
          behaviorScore: 'Good'
        }
      },
      {
        id: 'report_3',
        childId: 'child_1',
        childName: 'Alice Johnson',
        type: 'monthly',
        title: 'Monthly Progress Report - January 2024',
        period: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        generatedAt: '2024-01-31T20:00:00Z',
        status: 'completed',
        fileUrl: '/reports/report_3.pdf',
        fileSize: '5.8 MB',
        sections: {
          performance: true,
          attendance: true,
          behavior: true,
          teacherComments: true,
          recommendations: true,
          achievements: true,
          goals: true
        },
        summary: {
          overallGrade: 89,
          attendanceRate: 96,
          assignmentsCompleted: 45,
          behaviorScore: 'Excellent'
        }
      }
    ]

    // Filter by childId if provided
    let filteredReports = reports
    if (childId) {
      filteredReports = filteredReports.filter(r => r.childId === childId)
    }

    // Filter by type if provided
    if (type) {
      filteredReports = filteredReports.filter(r => r.type === type)
    }

    return NextResponse.json({
      success: true,
      data: {
        reports: filteredReports,
        total: filteredReports.length
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
