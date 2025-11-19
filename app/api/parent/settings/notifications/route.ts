import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, sms, push, frequency } = body

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const mockPreferences = {
      email: {
        gradesPosted: true,
        assignmentDue: true,
        liveClassSchedule: true,
        paymentReminders: true,
        lowPerformance: true,
        attendance: true,
        messages: true
      },
      sms: {
        gradesPosted: false,
        assignmentDue: true,
        liveClassSchedule: true,
        paymentReminders: true,
        lowPerformance: true,
        attendance: false,
        messages: false
      },
      push: {
        gradesPosted: true,
        assignmentDue: true,
        liveClassSchedule: true,
        paymentReminders: true,
        lowPerformance: true,
        attendance: true,
        messages: true
      },
      frequency: 'immediate'
    }

    return NextResponse.json({ success: true, data: mockPreferences })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
