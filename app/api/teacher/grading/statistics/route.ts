import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGradingStatistics } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/grading/statistics - Get grading statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId') || undefined

    // Fetch grading statistics using data service
    const statistics = await getGradingStatistics(user.id, courseId)

    return NextResponse.json({
      success: true,
      data: statistics
    })
  } catch (error) {
    console.error('Error fetching grading statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grading statistics' },
      { status: 500 }
    )
  }
}
