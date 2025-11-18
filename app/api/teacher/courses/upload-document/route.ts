import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('documents') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No document files provided' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}` },
          { status: 400 }
        )
      }

      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File size exceeds 50MB: ${file.name}` },
          { status: 400 }
        )
      }
    }

    const uploadedFiles = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = `doc_${Date.now()}_${i}_${file.name}`
      const fileUrl = `/uploads/documents/${fileName}`

      const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄'
        if (mimeType.includes('word')) return '📝'
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📈'
        return '📎'
      }

      uploadedFiles.push({
        id: `file_${Date.now()}_${i}`,
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        icon: getFileIcon(file.type),
        uploadedAt: new Date().toISOString(),
        isPrimary: i === 0
      })

      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles,
        totalFiles: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.fileSize, 0)
      }
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
