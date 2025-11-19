import { NextRequest, NextResponse } from 'next/server'

// GET /api/student/certificates - Get all certificates
export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database queries
    const mockCertificates = {
      earned: [
        {
          id: '1',
          courseName: 'Advanced Web Development',
          issueDate: '2024-01-15',
          certificateNumber: 'CERT-2024-001',
          verificationCode: 'ABC123XYZ',
          thumbnail: '/certificates/cert-1.jpg',
          status: 'earned'
        },
        {
          id: '2',
          courseName: 'Data Science Fundamentals',
          issueDate: '2024-02-20',
          certificateNumber: 'CERT-2024-002',
          verificationCode: 'DEF456UVW',
          thumbnail: '/certificates/cert-2.jpg',
          status: 'earned'
        }
      ],
      inProgress: [
        {
          id: '3',
          courseName: 'Machine Learning Basics',
          completionPercentage: 75,
          status: 'in-progress',
          requirements: [
            'Complete all lessons (75% done)',
            'Pass final exam (pending)',
            'Submit final project (pending)'
          ]
        },
        {
          id: '4',
          courseName: 'UI/UX Design Principles',
          completionPercentage: 45,
          status: 'in-progress',
          requirements: [
            'Complete all lessons (45% done)',
            'Complete 3 design projects (1/3 done)',
            'Peer review 5 designs (0/5 done)'
          ]
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockCertificates
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}
