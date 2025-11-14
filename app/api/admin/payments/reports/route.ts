import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/payments/reports - Generate financial reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'revenue'
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let reportData: any = {}

    switch (reportType) {
      case 'revenue':
        reportData = {
          type: 'revenue',
          period,
          data: {
            total: 125000,
            byMonth: [
              { month: 'Jan', revenue: 10000 },
              { month: 'Feb', revenue: 12000 },
              { month: 'Mar', revenue: 15000 },
              { month: 'Apr', revenue: 13000 },
              { month: 'May', revenue: 14000 },
              { month: 'Jun', revenue: 16000 },
              { month: 'Jul', revenue: 15000 },
              { month: 'Aug', revenue: 10000 },
              { month: 'Sep', revenue: 8000 },
              { month: 'Oct', revenue: 6000 },
              { month: 'Nov', revenue: 3000 },
              { month: 'Dec', revenue: 3000 }
            ],
            byCourse: [
              { course: 'Mathematics Grade 10', revenue: 45000, enrollments: 450 },
              { course: 'Physics Grade 11', revenue: 38000, enrollments: 380 },
              { course: 'Chemistry Grade 12', revenue: 42000, enrollments: 420 }
            ]
          }
        }
        break

      case 'gateway':
        reportData = {
          type: 'gateway',
          period,
          data: {
            byGateway: [
              { gateway: 'Stripe', revenue: 65000, transactions: 650, percentage: 52 },
              { gateway: 'PayPal', revenue: 37500, transactions: 375, percentage: 30 },
              { gateway: 'Razorpay', revenue: 22500, transactions: 225, percentage: 18 }
            ]
          }
        }
        break

      case 'performance':
        reportData = {
          type: 'performance',
          period,
          data: {
            topCourses: [
              { 
                course: 'Mathematics Grade 10', 
                revenue: 45000, 
                enrollments: 450,
                avgRating: 4.8,
                completionRate: 85
              },
              { 
                course: 'Chemistry Grade 12', 
                revenue: 42000, 
                enrollments: 420,
                avgRating: 4.7,
                completionRate: 82
              },
              { 
                course: 'Physics Grade 11', 
                revenue: 38000, 
                enrollments: 380,
                avgRating: 4.6,
                completionRate: 80
              }
            ]
          }
        }
        break

      case 'lifetime':
        reportData = {
          type: 'lifetime',
          period,
          data: {
            averageLTV: 285.50,
            segments: [
              { segment: 'High Value (>$500)', count: 150, totalValue: 95000 },
              { segment: 'Medium Value ($200-$500)', count: 450, totalValue: 157500 },
              { segment: 'Low Value (<$200)', count: 600, totalValue: 72000 }
            ]
          }
        }
        break

      case 'coupons':
        reportData = {
          type: 'coupons',
          period,
          data: {
            totalCoupons: 25,
            activeCoupons: 15,
            totalDiscount: 12500,
            topCoupons: [
              { code: 'SUMMER2024', uses: 150, discount: 4500, revenue: 22500 },
              { code: 'WELCOME10', uses: 320, discount: 3200, revenue: 28800 },
              { code: 'STUDENT20', uses: 85, discount: 2550, revenue: 10200 }
            ]
          }
        }
        break

      case 'refunds':
        reportData = {
          type: 'refunds',
          period,
          data: {
            totalRefunds: 45,
            totalAmount: 4500,
            refundRate: 3.6,
            byReason: [
              { reason: 'Course not as expected', count: 18, amount: 1800 },
              { reason: 'Technical issues', count: 12, amount: 1200 },
              { reason: 'Changed mind', count: 10, amount: 1000 },
              { reason: 'Other', count: 5, amount: 500 }
            ]
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      report: reportData,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/reports - Export report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, format, period } = body

    if (!reportType || !format) {
      return NextResponse.json(
        { error: 'Report type and format are required' },
        { status: 400 }
      )
    }

    // In real app, generate file based on format (CSV, Excel, PDF)
    const exportData = {
      exportId: `export_${Date.now()}`,
      reportType,
      format,
      period,
      status: 'processing',
      downloadUrl: null
    }

    // Simulate export processing
    setTimeout(() => {
      exportData.status = 'completed'
      exportData.downloadUrl = `/downloads/report_${exportData.exportId}.${format}`
    }, 2000)

    return NextResponse.json({
      message: 'Report export initiated',
      export: exportData
    }, { status: 202 })
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
