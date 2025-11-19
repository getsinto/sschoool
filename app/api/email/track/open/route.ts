import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/lib/email/analytics';

export const dynamic = 'force-dynamic';

/**
 * Email open tracking endpoint
 * Returns a 1x1 transparent pixel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailJobId = searchParams.get('id');

    if (emailJobId) {
      // Record the open event asynchronously
      EmailAnalyticsService.recordOpen(emailJobId).catch(error => {
        console.error('Error recording email open:', error);
      });
    }

    // Return a 1x1 transparent GIF pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Email tracking error:', error);
    
    // Still return a pixel even if tracking fails
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length.toString(),
      },
    });
  }
}
