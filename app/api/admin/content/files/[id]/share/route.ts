import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock shares data
const mockShares = new Map<string, any>()

// POST /api/admin/content/files/[id]/share - Create shareable link
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { expiryDays = 7, allowDownload = true, password } = body

    // Generate unique share token
    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    const share = {
      id: `share_${Date.now()}`,
      fileId: params.id,
      token: shareToken,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shareToken}`,
      expiryDate: expiryDate.toISOString(),
      allowDownload,
      password: password || null,
      accessCount: 0,
      createdBy: 'admin', // In real app, get from session
      createdAt: new Date().toISOString(),
      lastAccessed: null
    }

    mockShares.set(shareToken, share)

    return NextResponse.json({
      message: 'Shareable link created successfully',
      share
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: 'Failed to create shareable link' },
      { status: 500 }
    )
  }
}

// GET /api/admin/content/files/[id]/share - Get all shares for a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all shares for this file
    const fileShares = Array.from(mockShares.values()).filter(
      share => share.fileId === params.id
    )

    return NextResponse.json({
      shares: fileShares
    })
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content/files/[id]/share - Revoke all shares for a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (shareId) {
      // Delete specific share
      const share = Array.from(mockShares.entries()).find(
        ([_, s]) => s.id === shareId && s.fileId === params.id
      )
      
      if (share) {
        mockShares.delete(share[0])
      }
    } else {
      // Delete all shares for this file
      Array.from(mockShares.entries()).forEach(([token, share]) => {
        if (share.fileId === params.id) {
          mockShares.delete(token)
        }
      })
    }

    return NextResponse.json({
      message: 'Share(s) revoked successfully'
    })
  } catch (error) {
    console.error('Error revoking shares:', error)
    return NextResponse.json(
      { error: 'Failed to revoke shares' },
      { status: 500 }
    )
  }
}
