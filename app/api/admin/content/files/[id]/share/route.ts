import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Mock shared links storage
const sharedLinks = new Map()

// POST /api/admin/content/files/[id]/share - Generate share link
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { expiryDays } = body
    
    // Generate unique share token
    const token = randomBytes(32).toString('hex')
    
    // Calculate expiry date
    let expiryDate = null
    if (expiryDays > 0) {
      expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + expiryDays)
    }
    
    // Store share link
    const shareData = {
      fileId: params.id,
      token,
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate?.toISOString() || null,
      accessCount: 0
    }
    
    sharedLinks.set(token, shareData)
    
    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${token}`
    
    return NextResponse.json({
      shareUrl,
      token,
      expiryDate: shareData.expiryDate
    })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    )
  }
}

// GET /api/admin/content/files/[id]/share - Get existing share links
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const links = Array.from(sharedLinks.values())
      .filter(link => link.fileId === params.id)
      .map(link => ({
        token: link.token,
        createdAt: link.createdAt,
        expiryDate: link.expiryDate,
        accessCount: link.accessCount,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shared/${link.token}`
      }))
    
    return NextResponse.json({ links })
  } catch (error) {
    console.error('Error fetching share links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share links' },
      { status: 500 }
    )
  }
}