import { NextRequest, NextResponse } from 'next/server'

// GET /api/student/certificates/verify - Verify certificate
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Mock verification - replace with actual database lookup
    // In production, verify against blockchain or secure database
    const mockVerificationData = {
      'ABC123XYZ': {
        valid: true,
        studentName: 'John Doe',
        courseName: 'Advanced Web Development',
        issueDate: 'January 15, 2024',
        institution: 'Tech Academy',
        certificateNumber: 'CERT-2024-001'
      },
      'DEF456UVW': {
        valid: true,
        studentName: 'Jane Smith',
        courseName: 'Data Science Fundamentals',
        issueDate: 'February 20, 2024',
        institution: 'Tech Academy',
        certificateNumber: 'CERT-2024-002'
      }
    }

    const verificationResult = mockVerificationData[code as keyof typeof mockVerificationData]

    if (verificationResult) {
      return NextResponse.json({
        success: true,
        data: verificationResult
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification code'
      })
    }
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify certificate' },
      { status: 500 }
    )
  }
}
