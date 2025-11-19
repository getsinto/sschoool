import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const mockPerformance = {
      overallGPA: 3.5,
      gradeTrend: [
        { month: 'Jan', grade: 85 },
        { month: 'Feb', grade: 87 },
        { month: 'Mar', grade: 88 },
        { month: 'Apr', grade: 86 },
        { month: 'May', grade: 90 },
        { month: 'Jun', grade: 92 }
      ],
      subjectPerformance: [
        { subject: 'Mathematics', grade: 92 },
        { subject: 'Science', grade: 88 },
        { subject: 'English', grade: 85 },
        { subject: 'History', grade: 90 }
      ],
      courses: [],
      insights: {
        topSubjects: ['Mathematics', 'History'],
        needsAttention: ['English'],
        studyPattern: {},
        recommendations: []
      }
    }

    return NextResponse.json({ success: true, data: mockPerformance })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
