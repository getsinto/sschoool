import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'

    // Mock data - replace with actual database queries
    const gradesData = [
      {
        course: 'Advanced Mathematics',
        code: 'MATH-101',
        item: 'Quiz 3: Calculus',
        type: 'Quiz',
        score: 18,
        maxScore: 20,
        percentage: 90,
        date: '2024-01-15'
      },
      {
        course: 'Advanced Mathematics',
        code: 'MATH-101',
        item: 'Assignment 2: Problem Set',
        type: 'Assignment',
        score: 95,
        maxScore: 100,
        percentage: 95,
        date: '2024-01-12'
      },
      {
        course: 'Physics',
        code: 'PHYS-201',
        item: 'Lab Report 2',
        type: 'Assignment',
        score: 132,
        maxScore: 150,
        percentage: 88,
        date: '2024-01-14'
      }
    ]

    if (format === 'csv') {
      const headers = ['Course', 'Code', 'Item', 'Type', 'Score', 'Max Score', 'Percentage', 'Date']
      const csvRows = [
        headers.join(','),
        ...gradesData.map(row => [
          row.course,
          row.code,
          row.item,
          row.type,
          row.score,
          row.maxScore,
          row.percentage,
          row.date
        ].join(','))
      ]
      
      const csvContent = csvRows.join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=grades.csv'
        }
      })
    }

    if (format === 'excel') {
      // In a real implementation, generate Excel file here
      return NextResponse.json({
        success: true,
        message: 'Excel generation not implemented in mock',
        data: gradesData
      })
    }

    return NextResponse.json({
      success: true,
      data: gradesData
    })
  } catch (error) {
    console.error('Error exporting grades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export grades' },
      { status: 500 }
    )
  }
}
