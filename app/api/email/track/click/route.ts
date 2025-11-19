import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/lib/email/analytics';

export const dynamic = 'force-dynamic';

/**
 * Email click tracking endpoint
 * Records the click and redirects to the original URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailJobId = searchParams.get('id');
    const originalUrl = searchParams.get('url');

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(originalUrl);

    // Validate URL
    try {
      new URL(decodedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Record the click event asynchronously
    if (emailJobId) {
      EmailAnalyticsService.recordClick(emailJobId).catch(error => {
        console.error('Error recording email click:', error);
      });
    }

    // Redirect to the original URL
    return NextResponse.redirect(decodedUrl, 302);
  } catch (error) {
    console.error('Email click tracking error:', error);
    
    // Try to redirect anyway if we have a URL
    const { searchParams } = new URL(request.url);
    const originalUrl = searchParams.get('url');
    
    if (originalUrl) {
      try {
        const decodedUrl = decodeURIComponent(originalUrl);
        return NextResponse.redirect(decodedUrl, 302);
      } catch {
        // Fall through to error response
      }
    }

    return NextResponse.json(
      { error: 'Failed to process click tracking' },
      { status: 500 }
    );
  }
}
