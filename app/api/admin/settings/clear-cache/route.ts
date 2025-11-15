import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Clear cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cacheType = 'all' } = body

    // Mock cache clearing
    const cacheTypes = {
      all: ['pages', 'api', 'images', 'data'],
      pages: ['pages'],
      api: ['api'],
      images: ['images'],
      data: ['data']
    }

    const clearedTypes = cacheTypes[cacheType as keyof typeof cacheTypes] || cacheTypes.all

    // Mock cache statistics
    const stats = {
      cleared: clearedTypes,
      itemsCleared: Math.floor(Math.random() * 1000) + 100,
      sizeFreed: `${(Math.random() * 100 + 10).toFixed(2)} MB`,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Cache cleared successfully',
      stats
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

// GET - Get cache statistics
export async function GET(request: NextRequest) {
  try {
    // Mock cache statistics
    const stats = {
      totalSize: '245.8 MB',
      cacheTypes: {
        pages: { size: '120.5 MB', items: 1250 },
        api: { size: '45.2 MB', items: 3400 },
        images: { size: '65.8 MB', items: 890 },
        data: { size: '14.3 MB', items: 560 }
      },
      lastCleared: '2024-11-14T10:30:00Z'
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    )
  }
}
