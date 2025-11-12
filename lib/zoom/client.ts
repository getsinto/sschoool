// Zoom API Client
import crypto from 'crypto';

interface ZoomConfig {
  apiKey: string;
  apiSecret: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
}

class ZoomClient {
  private config: ZoomConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      apiKey: process.env.ZOOM_API_KEY || '',
      apiSecret: process.env.ZOOM_API_SECRET || '',
      accountId: process.env.ZOOM_ACCOUNT_ID || '',
      clientId: process.env.ZOOM_CLIENT_ID || '',
      clientSecret: process.env.ZOOM_CLIENT_SECRET || ''
    };

    if (!this.config.accountId || !this.config.clientId || !this.config.clientSecret) {
      console.warn('Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET');
    }
  }

  // Generate OAuth access token
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.config.accountId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Zoom access token:', error);
      throw new Error('Failed to authenticate with Zoom');
    }
  }

  // Make authenticated API request
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    const baseUrl = 'https://api.zoom.us/v2';

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Zoom API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Generate JWT token for SDK (deprecated but still used for some features)
  generateJWT(meetingNumber: string, role: 0 | 1): string {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 2; // 2 hours

    const payload = {
      sdkKey: this.config.apiKey,
      mn: meetingNumber,
      role: role, // 0 = participant, 1 = host
      iat: iat,
      exp: exp,
      appKey: this.config.apiKey,
      tokenExp: exp
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Generate SDK signature for Web SDK
  generateSignature(meetingNumber: string, role: 0 | 1): string {
    const timestamp = Date.now() - 30000;
    const msg = Buffer.from(
      `${this.config.apiKey}${meetingNumber}${timestamp}${role}`
    ).toString('base64');

    const hash = crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(msg)
      .digest('base64');

    return Buffer.from(
      `${this.config.apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`
    ).toString('base64');
  }

  // Verify webhook signature
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    const message = `v0:${timestamp}:${payload}`;
    const hashForVerify = crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(message)
      .digest('hex');

    const expectedSignature = `v0=${hashForVerify}`;
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// Export singleton instance
export const zoomClient = new ZoomClient();
