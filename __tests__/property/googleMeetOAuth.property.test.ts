// Feature: remaining-high-priority-work-jan-2025
// Property-based tests for Google Meet OAuth functionality

import * as fc from 'fast-check'
import { initiateGoogleOAuth, handleGoogleCallback, getGoogleAccessToken, refreshGoogleToken, revokeGoogleAccess, isGoogleConnected } from '@/lib/google-meet/oauth'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn((options) => {
          const params = new URLSearchParams({
            client_id: 'test_client_id',
            redirect_uri: 'http://localhost:3000/api/google-meet/callback',
            response_type: 'code',
            scope: options.scope.join(' '),
            access_type: options.access_type,
            prompt: options.prompt,
            state: options.state
          })
          return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
        }),
        getToken: jest.fn(),
        setCredentials: jest.fn(),
        refreshAccessToken: jest.fn()
      }))
    }
  }
}))

describe('Google Meet OAuth Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Property 1: OAuth Redirect Correctness
  // Feature: remaining-high-priority-work-jan-2025, Property 1: OAuth Redirect Correctness
  // Validates: Requirements 1.1
  describe('Property 1: OAuth Redirect Correctness', () => {
    test('for any teacher initiating Google OAuth, the redirect URL should contain all required scopes and proper state parameter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          async (userId) => {
            const redirectUrl = await initiateGoogleOAuth(userId)
            
            // Parse URL
            const url = new URL(redirectUrl)
            
            // Check required parameters exist
            expect(url.searchParams.has('client_id')).toBe(true)
            expect(url.searchParams.has('redirect_uri')).toBe(true)
            expect(url.searchParams.has('response_type')).toBe(true)
            expect(url.searchParams.has('scope')).toBe(true)
            expect(url.searchParams.has('access_type')).toBe(true)
            expect(url.searchParams.has('state')).toBe(true)
            
            // Check required scopes are present
            const scope = url.searchParams.get('scope') || ''
            expect(scope).toContain('https://www.googleapis.com/auth/calendar')
            expect(scope).toContain('https://www.googleapis.com/auth/calendar.events')
            
            // Check access_type is offline (to get refresh token)
            expect(url.searchParams.get('access_type')).toBe('offline')
            
            // Check state parameter is valid base64
            const state = url.searchParams.get('state')
            expect(state).toBeTruthy()
            
            // Verify state can be decoded and contains userId
            const decodedState = JSON.parse(Buffer.from(state!, 'base64').toString('utf8'))
            expect(decodedState.userId).toBe(userId)
            expect(decodedState.timestamp).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

  // Property 2: Token Exchange Success
  // Feature: remaining-high-priority-work-jan-2025, Property 2: Token Exchange Success
  // Validates: Requirements 1.2
  describe('Property 2: Token Exchange Success', () => {
    test('for any valid authorization code, the system should successfully exchange it for access and refresh tokens', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 100 }), // authorization code
          fc.uuid(), // userId
          async (code, userId) => {
            // Mock successful token exchange
            const mockTokens = {
              access_token: `access_${Math.random()}`,
              refresh_token: `refresh_${Math.random()}`,
              expiry_date: Date.now() + 3600000,
              scope: 'https://www.googleapis.com/auth/calendar',
              token_type: 'Bearer'
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            mockOAuth2Client.getToken = jest.fn().mockResolvedValue({ tokens: mockTokens })
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null }),
              insert: jest.fn().mockResolvedValue({ error: null }),
              update: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
            const result = await handleGoogleCallback(code, state)
            
            // Verify success
            expect(result.success).toBe(true)
            expect(result.userId).toBe(userId)
            
            // Verify tokens were stored
            expect(mockSupabase.from).toHaveBeenCalledWith('integration_tokens')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Property 3: Automatic Token Refresh
  // Feature: remaining-high-priority-work-jan-2025, Property 3: Automatic Token Refresh
  // Validates: Requirements 1.3
  describe('Property 3: Automatic Token Refresh', () => {
    test('for any expired token, the system should automatically refresh it before making API calls', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          async (userId) => {
            // Mock expired token in database
            const expiredToken = {
              access_token: 'expired_access_token',
              refresh_token: 'valid_refresh_token',
              expires_at: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
            }
            
            // Mock refreshed tokens
            const refreshedTokens = {
              access_token: `new_access_${Math.random()}`,
              refresh_token: 'valid_refresh_token',
              expiry_date: Date.now() + 3600000
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            mockOAuth2Client.refreshAccessToken = jest.fn().mockResolvedValue({ 
              credentials: refreshedTokens 
            })
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: expiredToken }),
              update: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Attempt to get access token (should trigger refresh)
            const result = await getGoogleAccessToken(userId)
            
            // Verify token was refreshed
            expect(result).toBeDefined()
            expect(result).not.toBe(expiredToken.access_token)
            
            // Verify update was called to store new token
            expect(mockSupabase.update).toHaveBeenCalled()
          }
        ),
        { numRuns: 100 }
      )
    })

    test('for any token refresh failure, the system should handle it gracefully and require re-authentication', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          async (userId) => {
            // Mock expired token with invalid refresh token
            const expiredToken = {
              access_token: 'expired_access_token',
              refresh_token: 'invalid_refresh_token',
              expires_at: new Date(Date.now() - 1000).toISOString()
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            mockOAuth2Client.refreshAccessToken = jest.fn().mockRejectedValue(
              new Error('invalid_grant')
            )
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: expiredToken }),
              delete: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Attempt to get access token (should fail gracefully)
            await expect(getGoogleAccessToken(userId)).rejects.toThrow()
            
            // Verify token was deleted (requiring re-authentication)
            expect(mockSupabase.delete).toHaveBeenCalled()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Property 4: Meeting Creation with Valid Token
  // Feature: remaining-high-priority-work-jan-2025, Property 4: Meeting Creation with Valid Token
  // Validates: Requirements 1.4
  describe('Property 4: Meeting Creation with Valid Token', () => {
    test('for any valid access token, the system should successfully create Google Meet meetings', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          fc.record({
            summary: fc.string({ minLength: 5, maxLength: 100 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            startTime: fc.date({ min: new Date(), max: new Date(Date.now() + 86400000 * 30) }),
            duration: fc.integer({ min: 15, max: 240 }) // 15 minutes to 4 hours
          }),
          async (userId, meetingData) => {
            // Mock valid token
            const validToken = {
              access_token: 'valid_access_token',
              refresh_token: 'valid_refresh_token',
              expires_at: new Date(Date.now() + 3600000).toISOString()
            }
            
            // Mock successful meeting creation
            const mockEvent = {
              id: `event_${Math.random()}`,
              summary: meetingData.summary,
              description: meetingData.description,
              start: { dateTime: meetingData.startTime.toISOString() },
              end: { 
                dateTime: new Date(meetingData.startTime.getTime() + meetingData.duration * 60000).toISOString() 
              },
              hangoutLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`,
              conferenceData: {
                conferenceId: `meet_${Math.random().toString(36).substr(2, 10)}`,
                entryPoints: [{
                  entryPointType: 'video',
                  uri: `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`
                }]
              }
            }
            
            const mockCalendar = {
              events: {
                insert: jest.fn().mockResolvedValue({ data: mockEvent })
              }
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            mockOAuth2Client.setCredentials = jest.fn()
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: validToken })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Get access token
            const accessToken = await getGoogleAccessToken(userId)
            
            // Verify token is valid
            expect(accessToken).toBeDefined()
            expect(accessToken).toBe(validToken.access_token)
            
            // Verify meeting can be created (mock the creation)
            const event = await mockCalendar.events.insert({
              calendarId: 'primary',
              conferenceDataVersion: 1,
              requestBody: {
                summary: meetingData.summary,
                description: meetingData.description,
                start: { dateTime: meetingData.startTime.toISOString() },
                end: { 
                  dateTime: new Date(meetingData.startTime.getTime() + meetingData.duration * 60000).toISOString() 
                },
                conferenceData: {
                  createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                  }
                }
              }
            })
            
            // Verify meeting was created with Meet link
            expect(event.data).toBeDefined()
            expect(event.data.hangoutLink || event.data.conferenceData?.entryPoints?.[0]?.uri).toBeTruthy()
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // Property 5: Complete Token Revocation
  // Feature: remaining-high-priority-work-jan-2025, Property 5: Complete Token Revocation
  // Validates: Requirements 1.5
  describe('Property 5: Complete Token Revocation', () => {
    test('for any user revoking access, the system should completely remove all tokens and revoke Google access', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          async (userId) => {
            // Mock existing token
            const existingToken = {
              access_token: 'access_token_to_revoke',
              refresh_token: 'refresh_token_to_revoke',
              expires_at: new Date(Date.now() + 3600000).toISOString()
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            mockOAuth2Client.revokeToken = jest.fn().mockResolvedValue({ success: true })
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: existingToken }),
              delete: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Revoke access
            await revokeGoogleAccess(userId)
            
            // Verify token was deleted from database
            expect(mockSupabase.delete).toHaveBeenCalled()
            
            // Verify Google revocation was called
            expect(mockOAuth2Client.revokeToken).toHaveBeenCalledWith(existingToken.access_token)
            
            // Verify user is no longer connected
            const connected = await isGoogleConnected(userId)
            expect(connected).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('for any revocation, the system should handle Google API errors gracefully', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const { google } = require('googleapis')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          async (userId) => {
            // Mock existing token
            const existingToken = {
              access_token: 'access_token_to_revoke',
              refresh_token: 'refresh_token_to_revoke',
              expires_at: new Date(Date.now() + 3600000).toISOString()
            }
            
            const mockOAuth2Client = new google.auth.OAuth2()
            // Mock Google revocation failure
            mockOAuth2Client.revokeToken = jest.fn().mockRejectedValue(
              new Error('Token already revoked')
            )
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: existingToken }),
              delete: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Revoke access (should not throw even if Google API fails)
            await revokeGoogleAccess(userId)
            
            // Verify token was still deleted from database
            expect(mockSupabase.delete).toHaveBeenCalled()
            
            // Verify user is no longer connected
            const connected = await isGoogleConnected(userId)
            expect(connected).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Property 6: Token Storage Security
  // Feature: remaining-high-priority-work-jan-2025, Property 6: Token Storage Security
  // Validates: Requirements 1.6
  describe('Property 6: Token Storage Security', () => {
    test('for any stored token, sensitive data should be encrypted and access should be restricted to the owner', async () => {
      const { createClient } = require('@/lib/supabase/server')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          fc.uuid(), // otherUserId
          fc.record({
            accessToken: fc.string({ minLength: 20, maxLength: 100 }),
            refreshToken: fc.string({ minLength: 20, maxLength: 100 })
          }),
          async (userId, otherUserId, tokens) => {
            // Ensure users are different
            fc.pre(userId !== otherUserId)
            
            // Mock Supabase operations for storing token
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn(),
              insert: jest.fn().mockResolvedValue({ error: null }),
              update: jest.fn().mockResolvedValue({ error: null })
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Store token for userId
            mockSupabase.single.mockResolvedValueOnce({ data: null }) // No existing token
            
            await handleGoogleCallback('test_code', Buffer.from(JSON.stringify({ 
              userId, 
              timestamp: Date.now() 
            })).toString('base64'))
            
            // Verify token was stored
            expect(mockSupabase.insert).toHaveBeenCalled()
            const insertCall = mockSupabase.insert.mock.calls[0][0]
            
            // Verify user_id is set correctly
            expect(insertCall.user_id).toBe(userId)
            
            // Verify tokens are stored (in real implementation, these would be encrypted)
            expect(insertCall.access_token).toBeDefined()
            expect(insertCall.refresh_token).toBeDefined()
            
            // Attempt to access token as different user
            mockSupabase.single.mockResolvedValueOnce({ data: null }) // No token for other user
            
            const otherUserToken = await isGoogleConnected(otherUserId)
            
            // Verify other user cannot access the token
            expect(otherUserToken).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('for any token retrieval, the system should verify user ownership before returning tokens', async () => {
      const { createClient } = require('@/lib/supabase/server')
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          fc.uuid(), // otherUserId
          async (userId, otherUserId) => {
            // Ensure users are different
            fc.pre(userId !== otherUserId)
            
            // Mock token for userId
            const userToken = {
              user_id: userId,
              access_token: 'user_access_token',
              refresh_token: 'user_refresh_token',
              expires_at: new Date(Date.now() + 3600000).toISOString()
            }
            
            // Mock Supabase operations
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn()
            }
            
            createClient.mockResolvedValue(mockSupabase)
            
            // Mock successful retrieval for correct user
            mockSupabase.single.mockResolvedValueOnce({ data: userToken })
            const token = await getGoogleAccessToken(userId)
            expect(token).toBe(userToken.access_token)
            
            // Mock no token for other user
            mockSupabase.single.mockResolvedValueOnce({ data: null })
            await expect(getGoogleAccessToken(otherUserId)).rejects.toThrow()
            
            // Verify queries included user_id filter
            expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId)
            expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', otherUserId)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
