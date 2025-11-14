import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{platform_name}}!',
    content: '<p>Welcome {{student_name}}!</p>',
    category: 'Onboarding',
    variables: ['student_name', 'platform_name']
  }
]

// GET /api/admin/communication/emails/templates
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ templates: mockTemplates })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST /api/admin/communication/emails/templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Template created successfully',
      template: newTemplate
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
