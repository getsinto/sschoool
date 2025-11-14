import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/payments/invoice/[id] - Generate invoice PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In real app, fetch transaction from database
    const transaction = {
      id: params.id,
      invoiceNumber: `INV-${Date.now()}`,
      transactionId: 'TXN001234567',
      studentName: 'John Doe',
      studentEmail: 'john.doe@example.com',
      studentAddress: '123 Student St, City, State 12345',
      courseName: 'Mathematics Grade 10',
      coursePrice: 99.99,
      discount: 10.00,
      couponCode: 'SUMMER10',
      subtotal: 89.99,
      tax: 0,
      total: 89.99,
      currency: 'USD',
      gateway: 'stripe',
      status: 'completed',
      date: '2024-01-15T10:30:00Z'
    }

    // In real app, generate PDF using library like jsPDF or pdfmake
    // const pdf = generateInvoicePDF(transaction)
    // return new Response(pdf, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="invoice-${transaction.invoiceNumber}.pdf"`
    //   }
    // })

    // For now, return invoice data
    return NextResponse.json({
      invoice: transaction,
      pdfUrl: `/invoices/${transaction.invoiceNumber}.pdf`
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/invoice/[id] - Email invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // In real app:
    // 1. Generate invoice PDF
    // 2. Send email with PDF attachment
    // 3. Log email activity

    console.log(`Sending invoice ${params.id} to ${email}`)

    return NextResponse.json({
      message: 'Invoice sent successfully',
      sentTo: email,
      sentAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
