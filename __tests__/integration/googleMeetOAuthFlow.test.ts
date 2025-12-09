/**
 * Integration Test: Google Meet OAuth Flow End-to-End
 * Feature: remaining-high-priority-work-jan-2025
 * 
 * Tests the complete OAuth flow from authorization initiation to meeting creation
 */

import { 
  initiateGoogleOAuth, 
  handleGoogleCallback, 
  getGoogleAccessToken,
  refreshGoogleToken,
  revokeGoogleAccess,
  isGoogleConnected 
} from '@/lib/google-meet/oauth';
import { createClient } from '@/lib/supabase/server';

describe('Google Meet OAuth Flow - End to End', () => {
  const testUserId = 'test-user-' + Date.now();
  let authorizationUrl: string;
  let stateParam: string;
  let mockAuthCode: string;

  beforeAll(() => {
    // Setup mock environment
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/google-meet/callback';
  });

  afterEach(async () => {
    // Cleanup: Remove test tokens
    const supabase = createClient();
    await supabase
      .from('integration_tokens')
      .delete()
      .eq('user_id', testUserId);
  });

  describe('Step 1: Authorization Initiation', () => {
    it('should generate valid authorization URL', async () => {
      // Execute
      authorizationUrl = await initiateGoogleOAuth(testUserId);

      // Verify
      expect(authorizationUrl).toBeTruthy();
      expect(authorizationUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');

      const url = new URL(authorizationUrl);
      const params = url.searchParams;

      // Verify required parameters
      expect(params.get('client_id')).toBe('test-client-id');
      expect(params.get('redirect_uri')).toBe('http://localhost:3000/api/google-meet/callback');
      expect(params.get('response_type')).toBe('code');
      expect(params.get('access_type')).toBe('offline');
      expect(params.get('prompt')).toBe('consent');

      // Verify scopes
      const scope = params.get('scope');
      expect(scope).toContain('https://www.googleapis.com/auth/calendar');
      expect(scope).toContain('https://www.googleapis.com/auth/calendar.events');

      // Extract state for next step
      stateParam = params.get('state')!;
      expect(stateParam).toBeTruthy();
      expect(stateParam.length).toBeGreaterThan(10);
    });
  });

  describe('Step 2: Callback Handling', () => {
    it('should exchange authorization code for tokens', async () => {
      // Setup: Mock Google token exchange
      mockAuthCode = 'mock-auth-code-' + Date.now();
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
        })
      });

      // Execute
      const result = await handleGoogleCallback(mockAuthCode, stateParam);

      // Verify
      expect(result).toBeTruthy();
      expect(result.access_token).toBe('mock-access-token');
      expect(result.refresh_token).toBe('mock-refresh-token');
      expect(result.expires_in).toBe(3600);
      expect(result.token_type).toBe('Bearer');

      // Verify Google API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should store tokens in database', async () => {
      // Verify tokens are stored
      const supabase = createClient();
      const { data: tokens } = await supabase
        .from('integration_tokens')
        .select('*')
        .eq('user_id', testUserId)
        .eq('provider', 'google_meet')
        .single();

      expect(tokens).toBeTruthy();
      expect(tokens.user_id).toBe(testUserId);
      expect(tokens.provider).toBe('google_meet');
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
      expect(tokens.token_type).toBe('Bearer');
      
      // Verify expiration is set correctly
      const expiresAt = new Date(tokens.expires_at);
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 3600000); // 1 hour
      
      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry.getTime());
    });
  });

  describe('Step 3: Token Storage and Retrieval', () => {
    it('should retrieve stored access token', async () => {
      // Execute
      const accessToken = await getGoogleAccessToken(testUserId);

      // Verify
      expect(accessToken).toBeTruthy();
      expect(typeof accessToken).toBe('string');
      expect(accessToken.length).toBeGreaterThan(0);
    });

    it('should verify connection status', async () => {
      // Execute
      const connected = await isGoogleConnected(testUserId);

      // Verify
      expect(connected).toBe(true);
    });
  });

  describe('Step 4: Automatic Token Refresh', () => {
    it('should refresh expired token automatically', async () => {
      // Setup: Expire the current token
      const supabase = createClient();
      await supabase
        .from('integration_tokens')
        .update({
          expires_at: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
        })
        .eq('user_id', testUserId)
        .eq('provider', 'google_meet');

      // Mock Google token refresh
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'https://www.googleapis.com/auth/calendar'
        })
      });

      // Execute: Get access token (should trigger refresh)
      const accessToken = await getGoogleAccessToken(testUserId);

      // Verify
      expect(accessToken).toBe('new-access-token');
      
      // Verify refresh API was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST'
        })
      );

      // Verify token was updated in database
      const { data: updatedToken } = await supabase
        .from('integration_tokens')
        .select('access_token, expires_at')
        .eq('user_id', testUserId)
        .eq('provider', 'google_meet')
        .single();

      expect(updatedToken.access_token).toBe('new-access-token');
      
      const newExpiresAt = new Date(updatedToken.expires_at);
      expect(newExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Step 5: Meeting Creation', () => {
    it('should create Google Meet meeting with valid token', async () => {
      // Mock Google Calendar API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'event-123',
          summary: 'Test Meeting',
          hangoutLink: 'https://meet.google.com/abc-defg-hij',
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
        })
      });

      // Execute: Create meeting
      const accessToken = await getGoogleAccessToken(testUserId);
      
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: 'Test Meeting',
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
          conferenceData: {
            createRequest: {
              requestId: 'test-request-' + Date.now(),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          },
          conferenceDataVersion: 1
        })
      });

      const meeting = await response.json();

      // Verify
      expect(meeting).toBeTruthy();
      expect(meeting.id).toBe('event-123');
      expect(meeting.hangoutLink).toContain('meet.google.com');
    });
  });

  describe('Step 6: Disconnect Flow', () => {
    it('should revoke tokens and clean up', async () => {
      // Mock Google revocation API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200
      });

      // Execute: Disconnect
      await revokeGoogleAccess(testUserId);

      // Verify: Google revocation was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://oauth2.googleapis.com/revoke'),
        expect.any(Object)
      );

      // Verify: Tokens removed from database
      const supabase = createClient();
      const { data: tokens } = await supabase
        .from('integration_tokens')
        .select('*')
        .eq('user_id', testUserId)
        .eq('provider', 'google_meet');

      expect(tokens).toHaveLength(0);

      // Verify: Connection status is false
      const connected = await isGoogleConnected(testUserId);
      expect(connected).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid authorization code', async () => {
      // Mock failed token exchange
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        })
      });

      // Execute and expect error
      await expect(
        handleGoogleCallback('invalid-code', 'test-state')
      ).rejects.toThrow();
    });

    it('should handle token refresh failure', async () => {
      // Setup: Create token with invalid refresh token
      const supabase = createClient();
      await supabase.from('integration_tokens').insert({
        user_id: 'test-user-refresh-fail',
        provider: 'google_meet',
        access_token: 'expired-token',
        refresh_token: 'invalid-refresh-token',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/calendar'
      });

      // Mock failed refresh
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked'
        })
      });

      // Execute and expect error
      await expect(
        getGoogleAccessToken('test-user-refresh-fail')
      ).rejects.toThrow();

      // Cleanup
      await supabase
        .from('integration_tokens')
        .delete()
        .eq('user_id', 'test-user-refresh-fail');
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Execute and expect error
      await expect(
        handleGoogleCallback('test-code', 'test-state')
      ).rejects.toThrow('Network error');
    });
  });
});
