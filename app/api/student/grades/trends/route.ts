import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'semester'

    // Mock data - replace with actual database queries
    let trendsData

    if (timeframe === 'semester') {
      trendsData = {
        period: 'Fall 2024',
        dataPoints: [
          { label: 'Week 1', average: 82, gpa: 3.2 },
          { label: 'Week 2', average: 85, gpa: 3.4 },
          { label: 'Week 3', average: 87, gpa: 3.5 },
          { label: 'Week 4', average: 88, gpa: 3.6 },
          { label: 'Week 5', average: 87, gpa: 3.5 },
          { label: 'Week 6', average: 89, gpa: 3.7 },
          { label: 'Week 7', average: 90, gpa: 3.8 },
          { label: 'Week 8', average: 88, gpa: 3.6 }
        ]
      }
    } else if (timeframe === 'year') {
      trendsData = {
        period: '2024',
        dataPoints: [
          { label: 'Jan', average: 85, gpa: 3.4 },
          { label: 'Feb', average: 87, gpa: 3.5 },
          { label: 'Mar', average: 88, gpa: 3.6 },
          { label: 'Apr', average: 86, gpa: 3.5 },
          { label: 'May', average: 89, gpa: 3.7 },
          { label: 'Jun', average: 90, gpa: 3.8 },
          { label: 'Sep', average: 88, gpa: 3.6 },
          { label: 'Oct', average: 89, gpa: 3.7 },
          { label: 'Nov', average: 90, gpa: 3.8 },
          { label: 'Dec', average: 91, gpa: 3.9 }
        ]
      }
    } else {
      trendsData = {
        period: 'All Time',
        dataPoints: [
          { label: 'Freshman', average: 82, gpa: 3.2 },
          { label: 'Sophomore', average: 86, gpa: 3.5 },
          { label: 'Junior', average: 89, gpa: 3.7 },
          { label: 'Senior', average: 91, gpa: 3.9 }
        ]
      }
    }

    const analysis = {
      trend: trendsData.dataPoints[trendsData.dataPoints.length - 1].average > 
             trendsData.dataPoints[0].average ? 'improving' : 'declining',
      improvement: trendsData.dataPoints[trendsData.dataPoints.length - 1].average - 
                   trendsData.dataPoints[0].average,
      consistency: 'moderate',
      prediction: {
        nextPeriod: trendsData.dataPoints[trendsData.dataPoints.length - 1].average + 1,
        confidence: 0.75
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: trendsData,
        analysis
      }
    })
  } catch (error) {
    console.error('Error fetching grade trends:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grade trends' },
      { status: 500 }
    )
  }
}
