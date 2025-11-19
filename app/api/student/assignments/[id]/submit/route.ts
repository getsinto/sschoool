import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/student/assignments/[id]/submit - Submit assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id
    const formData = await request.formData()
    
    const files = formData.getAll('files')
    const textContent = formData.get('textContent') as string

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Upload files and save to database
    console.log(`Submitting assignment ${assignmentId} for student ${studentId}`)
    console.log('Files:', files.length)
    console.log('Text content length:', textContent?.length || 0)

    const submission = {
      id: `sub_${Date.now()}`,
      assignmentId,
      studentId,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      files: files.map((file: any) => ({
        id: `file_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${file.name}`
      })),
      textContent,
      attemptNumber: 1
    }

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Assignment submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
}
