// Google Meet API Client
// Handles Google Calendar API and OAuth 2.0 authentication
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export class GoogleMeetClient {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth 2.0 authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<GoogleCredentials> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as GoogleCredentials;
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(credentials: GoogleCredentials): void {
    this.oauth2Client.setCredentials(credentials);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleCredentials> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials as GoogleCredentials;
  }

  /**
   * Get Calendar API instance
   */
  getCalendar() {
    return this.calendar;
  }

  /**
   * Check if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.calendar.calendarList.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique request ID for conference data
   */
  generateRequestId(): string {
    return `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let googleMeetClient: GoogleMeetClient | null = null;

export function getGoogleMeetClient(): GoogleMeetClient {
  if (!googleMeetClient) {
    googleMeetClient = new GoogleMeetClient();
  }
  return googleMeetClient;
}

// Helper function to check if Google credentials are configured
export function isGoogleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}
