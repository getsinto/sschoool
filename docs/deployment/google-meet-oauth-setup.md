# Google Meet OAuth Setup Guide

## Overview

This guide walks you through setting up Google Meet OAuth integration for the platform, allowing teachers to connect their Google accounts and create Google Meet sessions directly from the application.

## Prerequisites

- Google Cloud Platform account
- Admin access to the platform
- Environment variable configuration access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Online Education Platform"
4. Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - Google Calendar API
   - Google Meet API (if available)
3. Click "Enable" for each API

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in the required information:
   - App name: "Online Education Platform"
   - User support email: your-email@domain.com
   - Developer contact: your-email@domain.com
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (for testing phase)
6. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Select "Web application"
4. Configure:
   - Name: "Online Education Platform Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/google-meet/callback` (development)
     - `https://yourdomain.com/api/google-meet/callback` (production)
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback

# For production, use:
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback
```

## Step 6: Database Setup

The integration tokens table should already exist from the Zoom OAuth setup. Verify it includes the `google_meet` provider:

```sql
-- Verify the table exists
SELECT * FROM integration_tokens WHERE provider = 'google_meet' LIMIT 1;
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as a teacher

3. Navigate to Teacher Dashboard → Integrations → Google Meet

4. Click "Connect Google Account"

5. Authorize the application in the Google OAuth consent screen

6. Verify you're redirected back and see "Connected" status

7. Try creating a test Google Meet meeting

## Step 8: Production Deployment

1. Update environment variables in your production environment (Vercel, etc.)

2. Ensure the production redirect URI is added to Google Cloud Console

3. If using Vercel:
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GOOGLE_REDIRECT_URI
   ```

4. Deploy the application

5. Test the OAuth flow in production

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution**: Ensure the redirect URI in your environment variables exactly matches one of the authorized redirect URIs in Google Cloud Console.

### Error: "invalid_grant"

**Solution**: The authorization code may have expired. Try the OAuth flow again. Authorization codes are single-use and expire after 10 minutes.

### Error: "insufficient_permissions"

**Solution**: Ensure you've added the required scopes in the OAuth consent screen configuration.

### Token Refresh Fails

**Solution**: Check that the refresh token is being stored correctly. If the issue persists, the user may need to re-authorize.

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use HTTPS in production**: OAuth requires secure connections
3. **Rotate secrets regularly**: Update client secrets periodically
4. **Monitor token usage**: Check for unusual API activity
5. **Implement rate limiting**: Protect against abuse

## API Endpoints

- `GET /api/google-meet/auth` - Initiate OAuth flow
- `GET /api/google-meet/callback` - Handle OAuth callback
- `GET /api/google-meet/token` - Get current token status
- `DELETE /api/google-meet/disconnect` - Revoke access

## Support

For issues or questions:
- Check the [Google Calendar API documentation](https://developers.google.com/calendar)
- Review error logs in Sentry
- Contact the development team

## Next Steps

After setup is complete:
1. Train teachers on how to connect their Google accounts
2. Monitor OAuth success rates in analytics
3. Set up alerts for token refresh failures
4. Document any custom meeting settings
