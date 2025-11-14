import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/admin/communication/emails/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipients, subject, content, attachments, scheduleAt } = body

    // Validate required fields
    if (!recipients || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, integrate with Resend/SendGrid
    // For now, return mock response
    const emailId = `email_${Date.now()}`

    return NextResponse.json({
      message: scheduleAt ? 'Email scheduled successfully' : 'Email sent successfully',
      emailId,
      recipientCount: Array.isArray(recipients) ? recipients.length : 1,
      scheduledFor: scheduleAt || null
    }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
