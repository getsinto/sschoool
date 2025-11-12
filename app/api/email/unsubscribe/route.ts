import { NextRequest, NextResponse } from 'next/server';
import { EmailPreferences } from '@/lib/email/preferences';
import { EmailAnalyticsService } from '@/lib/email/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const emailJobId = searchParams.get('emailJobId');

    if (!token) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Invalid Unsubscribe Link</h1>
            <p>The unsubscribe link is invalid or has expired.</p>
          </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify token
    const { valid, userId, category } = EmailPreferences.verifyUnsubscribeToken(token);

    if (!valid || !userId) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Invalid or Expired Link</h1>
            <p>This unsubscribe link is invalid or has expired. Please contact support if you need assistance.</p>
          </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Unsubscribe user
    let success = false;
    if (category) {
      // Unsubscribe from specific category
      success = await EmailPreferences.updatePreference(userId, category, false, 'never');
    } else {
      // Unsubscribe from all marketing emails
      success = await EmailPreferences.unsubscribeFromAll(userId);
    }

    // Record unsubscribe event if emailJobId provided
    if (emailJobId) {
      await EmailAnalyticsService.recordUnsubscribe(emailJobId);
    }

    if (!success) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Unsubscribe Failed</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Unsubscribe Failed</h1>
            <p>We encountered an error processing your request. Please try again or contact support.</p>
          </body>
        </html>
        `,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Successfully Unsubscribed</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 50px auto; 
              padding: 20px;
              text-align: center;
            }
            .success { color: #16a34a; }
            .button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            }
            .button:hover { background-color: #1d4ed8; }
          </style>
        </head>
        <body>
          <h1 class="success">✓ Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from ${category ? `${category} emails` : 'marketing emails'}.</p>
          <p>You will no longer receive these types of emails from us.</p>
          <p><small>Note: You will still receive important transactional emails related to your account.</small></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" class="button">
            Manage Email Preferences
          </a>
        </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Error</h1>
          <p>An unexpected error occurred. Please try again later.</p>
        </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// POST endpoint for programmatic unsubscribe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, unsubscribeAll = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let success = false;

    if (unsubscribeAll) {
      success = await EmailPreferences.unsubscribeFromAll(userId);
    } else if (category) {
      success = await EmailPreferences.updatePreference(userId, category, false, 'never');
    } else {
      return NextResponse.json(
        { error: 'Either category or unsubscribeAll must be specified' },
        { status: 400 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: unsubscribeAll 
        ? 'Unsubscribed from all marketing emails'
        : `Unsubscribed from ${category} emails`
    });

  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
