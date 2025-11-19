import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchMethod, searchValue, relationship } = body

    return NextResponse.json({
      success: true,
      message: 'Link request sent successfully',
      data: {
        requestId: 'req_123',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send link request' },
      { status: 500 }
    )
  }
}
