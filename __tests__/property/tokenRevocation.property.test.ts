/**
 * Property-Based Test: Complete Token Revocation
 * Feature: remaining-high-priority-work-jan-2025, Property 5: Complete Token Revocation
 * Validates: Requirements 1.5
 * 
 * For any connected teacher, disconnecting should revoke tokens with Google
 * and delete all token records from database
 */

import fc from 'fast-check';
import { revokeGoogleAccess, isGoogleConnected } from '@/lib/google-meet/oauth';
import { createClient } from '@/lib/supabase/server';

describe('Property 5: Complete Token Revocation', () => {
  it('should revoke tokens with Google and delete from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.string({ minLength: 50, maxLength: 200 }), // access_token
        fc.string({ minLength: 50, maxLength: 200 }), // refresh_token
        async (userId, accessToken, refreshToken) => {
          // Setup: Create a mock token in database
          const supabase = createClient();
          
          // Insert test token
          await supabase.from('integration_tokens').insert({
            user_id: userId,
            provider: 'google_meet',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            token_type: 'Bearer',
            scope: 'https://www.googleapis.com/auth/calendar'
          });

          // Mock Google revocation API
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200
          });

          // Execute: Revoke access
          await revokeGoogleAccess(userId);

          // Property 1: Google revocation API should be called
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('https://oauth2.googleapis.com/revoke'),
            expect.any(Object)
          );

          // Property 2: Token should be deleted from database
          const { data: tokens } = await supabase
            .from('integration_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'google_meet');

          expect(tokens).toHaveLength(0);

          // Property 3: Connection status should be false
          const connected = await isGoogleConnected(userId);
          expect(connected).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle revocation even if Google API fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.string({ minLength: 50, maxLength: 200 }), // access_token
        async (userId, accessToken) => {
          // Setup: Create a mock token in database
          const supabase = createClient();
          
          await supabase.from('integration_tokens').insert({
            user_id: userId,
            provider: 'google_meet',
            access_token: accessToken,
            refresh_token: 'refresh_token',
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            token_type: 'Bearer',
            scope: 'https://www.googleapis.com/auth/calendar'
          });

          // Mock Google revocation API failure
          global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'invalid_token' })
          });

          // Execute: Revoke access (should not throw)
          await revokeGoogleAccess(userId);

          // Property: Token should still be deleted from database
          // even if Google API fails (best effort cleanup)
          const { data: tokens } = await supabase
            .from('integration_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'google_meet');

          expect(tokens).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should revoke all Google Meet tokens for a user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(
          fc.record({
            access_token: fc.string({ minLength: 50, maxLength: 200 }),
            refresh_token: fc.string({ minLength: 50, maxLength: 200 })
          }),
          { minLength: 1, maxLength: 3 }
        ), // Multiple tokens
        async (userId, tokens) => {
          // Setup: Create multiple tokens in database
          const supabase = createClient();
          
          for (const token of tokens) {
            await supabase.from('integration_tokens').insert({
              user_id: userId,
              provider: 'google_meet',
              access_token: token.access_token,
              refresh_token: token.refresh_token,
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              token_type: 'Bearer',
              scope: 'https://www.googleapis.com/auth/calendar'
            });
          }

          // Mock Google revocation API
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200
          });

          // Execute: Revoke access
          await revokeGoogleAccess(userId);

          // Property: All tokens should be revoked
          expect(global.fetch).toHaveBeenCalledTimes(tokens.length);

          // Property: All tokens should be deleted from database
          const { data: remainingTokens } = await supabase
            .from('integration_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'google_meet');

          expect(remainingTokens).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not affect other users tokens during revocation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId1
        fc.uuid(), // userId2
        fc.string({ minLength: 50, maxLength: 200 }), // token1
        fc.string({ minLength: 50, maxLength: 200 }), // token2
        async (userId1, userId2, token1, token2) => {
          fc.pre(userId1 !== userId2); // Ensure different users

          // Setup: Create tokens for both users
          const supabase = createClient();
          
          await supabase.from('integration_tokens').insert([
            {
              user_id: userId1,
              provider: 'google_meet',
              access_token: token1,
              refresh_token: 'refresh1',
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              token_type: 'Bearer',
              scope: 'https://www.googleapis.com/auth/calendar'
            },
            {
              user_id: userId2,
              provider: 'google_meet',
              access_token: token2,
              refresh_token: 'refresh2',
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              token_type: 'Bearer',
              scope: 'https://www.googleapis.com/auth/calendar'
            }
          ]);

          // Mock Google revocation API
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200
          });

          // Execute: Revoke access for user1 only
          await revokeGoogleAccess(userId1);

          // Property: User1's tokens should be deleted
          const { data: user1Tokens } = await supabase
            .from('integration_tokens')
            .select('*')
            .eq('user_id', userId1)
            .eq('provider', 'google_meet');

          expect(user1Tokens).toHaveLength(0);

          // Property: User2's tokens should remain intact
          const { data: user2Tokens } = await supabase
            .from('integration_tokens')
            .select('*')
            .eq('user_id', userId2)
            .eq('provider', 'google_meet');

          expect(user2Tokens).toHaveLength(1);
          expect(user2Tokens[0].access_token).toBe(token2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle revocation idempotently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        async (userId) => {
          // Mock Google revocation API
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200
          });

          // Execute: Revoke access multiple times
          await revokeGoogleAccess(userId);
          await revokeGoogleAccess(userId);
          await revokeGoogleAccess(userId);

          // Property: Multiple revocations should not cause errors
          // (idempotent operation)
          const connected = await isGoogleConnected(userId);
          expect(connected).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
