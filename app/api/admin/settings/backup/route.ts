import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List available backups
export async function GET(request: NextRequest) {
  try {
    // Mock backup list
    const backups = [
      {
        id: 'backup_1',
        filename: 'backup_2024-11-15_10-30.sql',
        size: '45.2 MB',
        created: '2024-11-15T10:30:00Z',
        type: 'auto'
      },
      {
        id: 'backup_2',
        filename: 'backup_2024-11-14_10-30.sql',
        size: '44.8 MB',
        created: '2024-11-14T10:30:00Z',
        type: 'auto'
      },
      {
        id: 'backup_3',
        filename: 'backup_manual_2024-11-13.sql',
        size: '43.5 MB',
        created: '2024-11-13T15:45:00Z',
        type: 'manual'
      }
    ]

    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Backup list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}

// POST - Create new backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'manual', includeUploads = true } = body

    // Mock backup creation
    const backup = {
      id: `backup_${Date.now()}`,
      filename: `backup_${type}_${new Date().toISOString().split('T')[0]}.sql`,
      size: '45.2 MB',
      created: new Date().toISOString(),
      type,
      includeUploads,
      status: 'completed'
    }

    return NextResponse.json({
      message: 'Backup created successfully',
      backup
    }, { status: 201 })
  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

// DELETE - Delete backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backupId = searchParams.get('id')

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      )
    }

    // Mock backup deletion
    return NextResponse.json({
      message: 'Backup deleted successfully',
      backupId
    })
  } catch (error) {
    console.error('Backup deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}
