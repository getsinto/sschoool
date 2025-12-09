import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validateFile,
  uploadFile,
  processImage,
  processVideo,
  processDocument,
  scanForMalware,
} from '@/lib/uploads/file-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'image' | 'video' | 'document'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!fileType || !['image', 'video', 'document'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type specified' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, fileType as 'image' | 'video' | 'document');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Scan for malware
    const malwareScan = scanForMalware(file);
    if (!malwareScan.safe) {
      return NextResponse.json(
        { error: 'File failed security scan', details: malwareScan.reason },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const uploadResult = await uploadFile(file, fileType as 'image' | 'video' | 'document', user.id);
    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    // Process based on file type
    let metadata: any = {};
    try {
      switch (fileType) {
        case 'image':
          metadata = await processImage(file);
          break;
        case 'video':
          metadata = await processVideo(file);
          break;
        case 'document':
          metadata = await processDocument(file);
          break;
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // Continue even if processing fails
    }

    // Return success response with URL and metadata
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path,
      metadata: {
        ...metadata,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}
