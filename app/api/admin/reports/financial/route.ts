import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface FinancialReportData {
  metrics: {
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    dailyRevenue: number
    averageTransactionValue: number
    totalTransactions: number
    successRate: number
    refundRate: number
    outstandingPayments: number
  }
  revenueTrend: Array<{
    period: string
    revenue: number
    transactions: number
    growth: number
  }>
  revenueByGateway: Array<{
    gateway: string
    revenue: number
    transactions: number
    successRate: number
    fees: number
    marketShare: number
  }>
  revenueByCourse: Array<{
    courseId: string
    courseName: string
    revenue: number
    enrollments: number
    averagePrice: number
    refunds: number
    netRevenue: number
  }>
  paymentAnalysis: {
    successfulPayments: number
    failedPayments: number
    refundedPayments: number
    chargebackRate: number
  }
  couponAnalytics: Array<{
    code: string
    usage: number
    discountAmount: number
    roi: number
    revenueImpact: number
  }>
  forecast: {
    nextMonth: number
    nextQuarter: number
    confidence: number
    growthRate: number
  }
}

// Mock data generation
const generateFinancialReportData = (filters: any): FinancialReportData => {
  const totalRevenue = 485750.50
  const monthlyRevenue = 52340.25
  
  return {
    metrics: {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue: 12850.75,
      dailyRevenue: 1840.30,
      averageTransactionValue: 298.45,
      totalTransactions: 1627,
      successRate: 96.8,
      refundRate: 2.1,
      outstandingPayments: 8450.00
    },
    revenueTrend: [
      { period: '2023-08', revenue: 38250.00, transactions: 128, growth: 5.2 },
      { period: '2023-09', revenue: 42180.50, transactions: 141, growth: 10.3 },
      { period: '2023-10', revenue: 45920.75, transactions: 154, growth: 8.9 },
      { period: '2023-11', revenue: 48650.25, transactions: 163, growth: 5.9 },
      { period: '2023-12', revenue: 51240.80, transactions: 172, growth: 5.3 },
      { period: '2024-01', revenue: monthlyRevenue, transactions: 175, growth: 2.1 }
    ],
    revenueByGateway: [
      {
        gateway: 'Stripe',
        revenue: 285420.30,
        transactions: 956,
        successRate: 97.2,
        fees: 8562.61,
        marketShare: 58.7
      },
      {
        gateway: 'PayPal',
        revenue: 142850.75,
        transactions: 478,
        successRate: 96.8,
        fees: 4285.52,
        marketShare: 29.4
      },
      {
        gateway: 'Razorpay',
        revenue: 57479.45,
        transactions: 193,
        successRate: 95.9,
        fees: 1149.59,
        marketShare: 11.9
      }
    ],
    revenueByCourse: [
      {
        courseId: 'course_1',
        courseName: 'Mathematics Grade 10',
        revenue: 89750.00,
        enrollments: 299,
        averagePrice: 300.17,
        refunds: 3,
        netRevenue: 88849.49
      },
      {
        courseId: 'course_2',
        courseName: 'Physics Grade 11',
        revenue: 75680.50,
        enrollments: 189,
        averagePrice: 400.43,
        refunds: 2,
        netRevenue: 74879.64
      },
      {
        courseId: 'course_3',
        courseName: 'Chemistry Grade 9',
        revenue: 62340.25,
        enrollments: 249,
        averagePrice: 250.36,
        refunds: 5,
        netRevenue: 61088.45
      }
    ],
    paymentAnalysis: {
      successfulPayments: 1575,
      failedPayments: 52,
      refundedPayments: 34,
      chargebackRate: 0.3
    },
    couponAnalytics: [
      {
        code: 'SAVE20',
        usage: 145,
        discountAmount: 28950.00,
        roi: 2.3,
        revenueImpact: -5.96
      },
      {
        code: 'NEWSTUDENT50',
        usage: 89,
        discountAmount: 4450.00,
        roi: 3.8,
        revenueImpact: -0.92
      },
      {
        code: 'HOLIDAY25',
        usage: 234,
        discountAmount: 15680.50,
        roi: 1.9,
        revenueImpact: -3.23
      }
    ],
    forecast: {
      nextMonth: monthlyRevenue * 1.05,
      nextQuarter: monthlyRevenue * 3 * 1.08,
      confidence: 87.5,
      growthRate: 5.2
    }
  }
}

// GET /api/admin/reports/financial - Get financial report data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'daily', 'weekly', 'monthly', 'yearly'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const gateway = searchParams.get('gateway')
    const course = searchParams.get('course')
    const format = searchParams.get('format') // 'json', 'pdf', 'excel', 'csv'

    const filters = {
      period: period || 'monthly',
      dateFrom,
      dateTo,
      gateway,
      course
    }

    const reportData = generateFinancialReportData(filters)

    // If format is specified, generate file export
    if (format && format !== 'json') {
      // In real app, generate PDF/Excel/CSV file
      const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.${format}`
      
      return NextResponse.json({
        message: 'Financial report generated successfully',
        downloadUrl: `/reports/exports/${fileName}`,
        fileName,
        format
      })
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      filters,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json(
      { error: 'Failed to generate financial report' },
      { status: 500 }
    )
  }
}

// POST /api/admin/reports/financial - Generate custom financial report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      reportType,
      filters,
      metrics,
      format,
      schedule,
      includeForecasting
    } = body

    // Validate required fields
    if (!reportType || !filters) {
      return NextResponse.json(
        { error: 'Missing required fields: reportType, filters' },
        { status: 400 }
      )
    }

    // Generate report based on custom parameters
    const reportData = generateFinancialReportData(filters)

    // Add forecasting data if requested
    if (includeForecasting) {
      // In real app, run forecasting algorithms
      reportData.forecast = {
        ...reportData.forecast,
        nextMonth: reportData.metrics.monthlyRevenue * 1.05,
        nextQuarter: reportData.metrics.monthlyRevenue * 3 * 1.08,
        confidence: 87.5,
        growthRate: 5.2
      }
    }

    // If scheduling is requested
    if (schedule) {
      // In real app, create scheduled report job
      const scheduledReport = {
        id: `scheduled_${Date.now()}`,
        reportType,
        filters,
        metrics,
        format: format || 'pdf',
        frequency: schedule.frequency,
        recipients: schedule.recipients,
        nextRun: schedule.nextRun,
        createdAt: new Date().toISOString()
      }

      return NextResponse.json({
        message: 'Financial report scheduled successfully',
        scheduledReport
      }, { status: 201 })
    }

    // Generate immediate report
    const reportId = `report_${Date.now()}`
    
    return NextResponse.json({
      message: 'Financial report generated successfully',
      reportId,
      data: reportData,
      downloadUrl: format ? `/reports/exports/financial-report-${reportId}.${format}` : null
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating financial report:', error)
    return NextResponse.json(
      { error: 'Failed to create financial report' },
      { status: 500 }
    )
  }
}