import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ReminderRecipient {
  id: string
  name: string
  email: string
  phone?: string
}

// POST /api/admin/live-classes/send-reminders - Send class reminders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, reminderType, recipients, channels } = body

    if (!classId || !reminderType || !recipients || !channels) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate reminder type
    const validTypes = ['immediate', '1hour', '24hours', '1week']
    if (!validTypes.includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminder type' },
        { status: 400 }
      )
    }

    // Validate channels
    const validChannels = ['email', 'sms', 'push']
    const invalidChannels = channels.filter((ch: string) => !validChannels.includes(ch))
    if (invalidChannels.length > 0) {
      return NextResponse.json(
        { error: `Invalid channels: ${invalidChannels.join(', ')}` },
        { status: 400 }
      )
    }

    // In real app, fetch class details from database
    const classDetails = {
      id: classId,
      title: 'Introduction to Algebra',
      date: '2024-01-20',
      time: '10:00',
      duration: 60,
      meetingLink: 'https://zoom.us/j/123456789',
      platform: 'zoom'
    }

    const results = {
      sent: 0,
      failed: 0,
      details: [] as any[]
    }

    // Send reminders via each channel
    for (const recipient of recipients) {
      for (const channel of channels) {
        try {
          if (channel === 'email') {
            // In real app, send email via email service (Resend, SendGrid, etc.)
            await sendEmailReminder(recipient, classDetails, reminderType)
            results.sent++
            results.details.push({
              recipientId: recipient.id,
              channel: 'email',
              status: 'sent',
              sentAt: new Date().toISOString()
            })
          } else if (channel === 'sms') {
            // In real app, send SMS via SMS service (Twilio, etc.)
            if (recipient.phone) {
              await sendSMSReminder(recipient, classDetails, reminderType)
              results.sent++
              results.details.push({
                recipientId: recipient.id,
                channel: 'sms',
                status: 'sent',
                sentAt: new Date().toISOString()
              })
            } else {
              results.failed++
              results.details.push({
                recipientId: recipient.id,
                channel: 'sms',
                status: 'failed',
                error: 'No phone number'
              })
            }
          } else if (channel === 'push') {
            // In real app, send push notification
            await sendPushReminder(recipient, classDetails, reminderType)
            results.sent++
            results.details.push({
              recipientId: recipient.id,
              channel: 'push',
              status: 'sent',
              sentAt: new Date().toISOString()
            })
          }
        } catch (error: any) {
          results.failed++
          results.details.push({
            recipientId: recipient.id,
            channel,
            status: 'failed',
            error: error.message
          })
        }
      }
    }

    // In real app, log reminder activity to database
    console.log('Reminders sent:', results)

    return NextResponse.json({
      message: 'Reminders sent successfully',
      results
    }, { status: 200 })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

// Helper functions (mock implementations)
async function sendEmailReminder(recipient: ReminderRecipient, classDetails: any, reminderType: string) {
  // In real app, use email service
  console.log(`Sending email reminder to ${recipient.email}`)
  
  const subject = getReminderSubject(reminderType, classDetails.title)
  const body = getReminderBody(reminderType, classDetails)
  
  // Mock email sending
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return { success: true }
}

async function sendSMSReminder(recipient: ReminderRecipient, classDetails: any, reminderType: string) {
  // In real app, use SMS service (Twilio, etc.)
  console.log(`Sending SMS reminder to ${recipient.phone}`)
  
  const message = getSMSMessage(reminderType, classDetails)
  
  // Mock SMS sending
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return { success: true }
}

async function sendPushReminder(recipient: ReminderRecipient, classDetails: any, reminderType: string) {
  // In real app, use push notification service
  console.log(`Sending push notification to ${recipient.id}`)
  
  const notification = {
    title: getReminderSubject(reminderType, classDetails.title),
    body: getSMSMessage(reminderType, classDetails),
    data: {
      classId: classDetails.id,
      type: 'class_reminder'
    }
  }
  
  // Mock push sending
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return { success: true }
}

function getReminderSubject(type: string, classTitle: string): string {
  switch (type) {
    case 'immediate':
      return `Class Starting Now: ${classTitle}`
    case '1hour':
      return `Class Starting in 1 Hour: ${classTitle}`
    case '24hours':
      return `Class Tomorrow: ${classTitle}`
    case '1week':
      return `Upcoming Class: ${classTitle}`
    default:
      return `Class Reminder: ${classTitle}`
  }
}

function getReminderBody(type: string, classDetails: any): string {
  const timeText = getTimeText(type)
  return `
    Your class "${classDetails.title}" is ${timeText}.
    
    Date: ${classDetails.date}
    Time: ${classDetails.time}
    Duration: ${classDetails.duration} minutes
    Platform: ${classDetails.platform}
    
    Join Link: ${classDetails.meetingLink}
    
    See you there!
  `
}

function getSMSMessage(type: string, classDetails: any): string {
  const timeText = getTimeText(type)
  return `Class "${classDetails.title}" ${timeText}. Join: ${classDetails.meetingLink}`
}

function getTimeText(type: string): string {
  switch (type) {
    case 'immediate':
      return 'starting now'
    case '1hour':
      return 'starting in 1 hour'
    case '24hours':
      return 'starting tomorrow'
    case '1week':
      return 'starting in 1 week'
    default:
      return 'coming up'
  }
}

// GET /api/admin/live-classes/send-reminders - Get reminder history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // In real app, fetch from database
    const reminderHistory = [
      {
        id: 'reminder_1',
        classId,
        type: '24hours',
        sentAt: '2024-01-19T10:00:00Z',
        recipients: 25,
        channels: ['email', 'sms'],
        sent: 48,
        failed: 2
      }
    ]

    return NextResponse.json({
      reminders: reminderHistory
    })
  } catch (error) {
    console.error('Error fetching reminder history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder history' },
      { status: 500 }
    )
  }
}
