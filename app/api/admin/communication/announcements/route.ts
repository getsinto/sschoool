import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Announcement {
  id: string
  title: string
  content: string
  targetAudience: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
  views: number
  sendEmail: boolean
  sendSMS: boolean
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

// Mock announcements data
const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'New Course Launch: Advanced Mathematics',
    content: '<p>We are excited to announce the launch of our new Advanced Mathematics course. This comprehensive program covers calculus, linear algebra, and statistics.</p><p>Enrollment starts on February 1st, 2024.</p>',
    targetAudience: ['students', 'parents'],
    priority: 'high',
    status: 'published',
    publishedAt: '2024-01-18T09:00:00Z',
    createdAt: '2024-01-17T14:30:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    createdBy: 'admin_1',
    createdByName: 'Admin User',
    views: 1250,
    sendEmail: true,
    sendSMS: false,
    attachments: []
  },
  {
    id: 'ann_2',
    title: 'System Maintenance Scheduled',
    content: '<p>We will be performing scheduled maintenance on our platform on January 25th from 2:00 AM to 4:00 AM EST.</p><p>During this time, the platform will be temporarily unavailable. We apologize for any inconvenience.</p>',
    targetAudience: ['all'],
    priority: 'urgent',
    status: 'scheduled',
    scheduledAt: '2024-01-24T18:00:00Z',
    createdAt: '2024-01-18T10:15:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    createdBy: 'admin_2',
    createdByName: 'Technical Admin',
    views: 0,
    sendEmail: true,
    sendSMS: true,
    attachments: []
  },
  {
    id: 'ann_3',
    title: 'Teacher Training Workshop',
    content: '<p>Join us for a comprehensive teacher training workshop on modern teaching methodologies and digital tools.</p><p>Date: February 15th, 2024<br>Time: 10:00 AM - 4:00 PM<br>Location: Main Conference Room</p>',
    targetAudience: ['teachers'],
    priority: 'normal',
    status: 'draft',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    createdBy: 'admin_1',
    createdByName: 'Admin User',
    views: 0,
    sendEmail: false,
    sendSMS: false,
    attachments: [
      {
        id: 'att_1',
        name: 'workshop-agenda.pdf',
        url: '/uploads/announcements/workshop-agenda.pdf',
        type: 'application/pdf'
      }
    ]
  }
]

// GET /api/admin/communication/announcements - Get all announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const audience = searchParams.get('audience')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredAnnouncements = [...mockAnnouncements]

    // Apply filters
    if (status && status !== 'all') {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.status === status)
    }

    if (audience && audience !== 'all') {
      filteredAnnouncements = filteredAnnouncements.filter(ann => 
        ann.targetAudience.includes(audience) || ann.targetAudience.includes('all')
      )
    }

    if (priority && priority !== 'all') {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.priority === priority)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredAnnouncements = filteredAnnouncements.filter(ann => 
        ann.title.toLowerCase().includes(searchLower) ||
        ann.content.toLowerCase().includes(searchLower)
      )
    }

    // Sort by creation date (newest first)
    filteredAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex)

    return NextResponse.json({
      announcements: paginatedAnnouncements,
      pagination: {
        page,
        limit,
        total: filteredAnnouncements.length,
        totalPages: Math.ceil(filteredAnnouncements.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST /api/admin/communication/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      targetAudience,
      priority,
      status,
      scheduledAt,
      sendEmail,
      sendSMS,
      attachments
    } = body

    // Validate required fields
    if (!title || !content || !targetAudience || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate target audience
    const validAudiences = ['all', 'students', 'teachers', 'parents']
    const invalidAudiences = targetAudience.filter((aud: string) => !validAudiences.includes(aud))
    if (invalidAudiences.length > 0) {
      return NextResponse.json(
        { error: `Invalid target audience: ${invalidAudiences.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate scheduled date if status is scheduled
    if (status === 'scheduled' && !scheduledAt) {
      return NextResponse.json(
        { error: 'Scheduled date is required for scheduled announcements' },
        { status: 400 }
      )
    }

    if (status === 'scheduled' && new Date(scheduledAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      )
    }

    // Create new announcement
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      content,
      targetAudience,
      priority,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
      scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin_current', // In real app, get from session
      createdByName: 'Current Admin',
      views: 0,
      sendEmail: sendEmail || false,
      sendSMS: sendSMS || false,
      attachments: attachments || []
    }

    // In real app, save to database
    mockAnnouncements.push(newAnnouncement)

    // If publishing immediately, send notifications
    if (status === 'published' && (sendEmail || sendSMS)) {
      // In real app, queue notification jobs
      console.log('Queuing notifications for announcement:', newAnnouncement.id)
    }

    // If scheduling, set up scheduled job
    if (status === 'scheduled') {
      // In real app, schedule publication job
      console.log('Scheduling announcement for:', scheduledAt)
    }

    return NextResponse.json({
      message: 'Announcement created successfully',
      announcement: newAnnouncement
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}