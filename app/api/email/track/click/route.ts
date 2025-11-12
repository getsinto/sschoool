import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/lib/email/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailJobId = searchParams.get('id');
    const url = searchParams.get('url');

    if (emailJobId) {
      await EmailAnalyticsService.recordClick(emailJobId);
    }

    // Redirect to original URL
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url));
    }

    // If no URL provided, redirect to home
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://example.com');

  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://example.com');
  }
}
