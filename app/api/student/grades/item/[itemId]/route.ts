import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId

    // Mock data - replace with actual database queries
    const mockGradeDetail = {
      id: itemId,
      type: 'assignment',
      title: 'Essay: World War I Analysis',
      courseName: 'World History',
      courseId: 'hist-101',
      score: 185,
      maxScore: 200,
      percentage: 92.5,
      letterGrade: 'A-',
      submittedAt: '2024-01-10T15:30:00Z',
      gradedAt: '2024-01-12T10:00:00Z',
      feedback: {
        overall: 'Excellent analysis with strong historical evidence. Your argument is well-structured and supported.',
        strengths: [
          'Clear thesis statement',
          'Strong use of primary sources',
          'Logical flow of arguments'
        ],
        improvements: [
          'Could expand on economic factors',
          'Minor citation formatting issues'
        ]
      },
      rubric: [
        {
          criterion: 'Thesis & Argument',
          maxPoints: 50,
          earned: 48,
          feedback: 'Strong, clear thesis with excellent support'
        },
        {
          criterion: 'Research & Sources',
          maxPoints: 50,
          earned: 45,
          feedback: 'Good use of sources, could include more primary documents'
        },
        {
          criterion: 'Organization',
          maxPoints: 50,
          earned: 47,
          feedback: 'Well-organized with clear transitions'
        },
        {
          criterion: 'Writing Quality',
          maxPoints: 50,
          earned: 45,
          feedback: 'Clear writing with minor grammatical issues'
        }
      ],
      classStats: {
        average: 175,
        median: 180,
        highest: 198,
        lowest: 120,
        yourRank: 3,
        totalStudents: 25
      },
      files: [
        {
          name: 'wwi-essay.pdf',
          url: '/uploads/wwi-essay.pdf',
          size: 245000,
          uploadedAt: '2024-01-10T15:30:00Z'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockGradeDetail
    })
  } catch (error) {
    console.error('Error fetching grade details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grade details' },
      { status: 500 }
    )
  }
}
