import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock settings data
    const settings = {
      general: {
        siteName: 'St Haroon Online School',
        siteDescription: 'Quality online education platform',
        contactEmail: 'support@stharoon.com',
        timezone: 'UTC'
      },
      features: {
        enableRegistration: true,
        enablePayments: true,
        enableLiveClasses: true,
        enableCertificates: true
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // TODO: Save settings to database
    console.log('Saving settings:', settings)
    
    return NextResponse.json({ message: 'Settings saved successfully' })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}