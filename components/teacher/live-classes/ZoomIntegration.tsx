'use client'

// Zoom API Integration Wrapper
// This component provides functions to interact with Zoom API

interface ZoomMeetingSettings {
  topic: string
  type: number // 1=Instant, 2=Scheduled, 3=Recurring no fixed time, 8=Recurring fixed time
  start_time?: string
  duration?: number
  timezone?: string
  password?: string
  agenda?: string
  settings?: {
    host_video?: boolean
    participant_video?: boolean
    join_before_host?: boolean
    mute_upon_entry?: boolean
    watermark?: boolean
    use_pmi?: boolean
    approval_type?: number
    audio?: string
    auto_recording?: string
    waiting_room?: boolean
  }
}

interface ZoomMeeting {
  id: string
  topic: string
  type: number
  start_time: string
  duration: number
  timezone: string
  created_at: string
  start_url: string
  join_url: string
  password?: string
  settings: any
}

export class ZoomIntegration {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string = 'https://api.zoom.us/v2'

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  // Create a new Zoom meeting
  async createMeeting(userId: string, settings: ZoomMeetingSettings): Promise<ZoomMeeting> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/users/${userId}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Zoom API error:', errorData)
        throw new Error('Failed to create Zoom meeting')
      }

      const meeting = await response.json()
      return meeting
    } catch (error) {
      console.error('Zoom create meeting error:', error)
      throw error
    }
  }

  // Get meeting details
  async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get Zoom meeting')
      }

      const meeting = await response.json()
      return meeting
    } catch (error) {
      console.error('Zoom get meeting error:', error)
      throw error
    }
  }

  // Update meeting
  async updateMeeting(meetingId: string, settings: Partial<ZoomMeetingSettings>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to update Zoom meeting')
      }
    } catch (error) {
      console.error('Zoom update meeting error:', error)
      throw error
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete Zoom meeting')
      }
    } catch (error) {
      console.error('Zoom delete meeting error:', error)
      throw error
    }
  }

  // Get meeting recordings
  async getRecordings(meetingId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get Zoom recordings')
      }

      const recordings = await response.json()
      return recordings
    } catch (error) {
      console.error('Zoom get recordings error:', error)
      throw error
    }
  }

  // Get meeting participants (attendance)
  async getParticipants(meetingId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/past_meetings/${meetingId}/participants`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get Zoom participants')
      }

      const participants = await response.json()
      return participants
    } catch (error) {
      console.error('Zoom get participants error:', error)
      throw error
    }
  }

  // Start meeting (returns start URL)
  getStartUrl(meeting: ZoomMeeting): string {
    return meeting.start_url
  }

  // Get join URL
  getJoinUrl(meeting: ZoomMeeting): string {
    return meeting.join_url
  }

  // Private method to get access token
  private async getAccessToken(): Promise<string> {
    // Get token from API endpoint
    const response = await fetch('/api/zoom/token')
    if (!response.ok) {
      throw new Error('Failed to get Zoom access token')
    }
    const data = await response.json()
    return data.access_token
  }

  // Generate meeting password
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}

// Hook for using Zoom integration
export function useZoomIntegration() {
  // TODO: Get API credentials from environment variables or settings
  const apiKey = process.env.NEXT_PUBLIC_ZOOM_API_KEY || ''
  const apiSecret = process.env.NEXT_PUBLIC_ZOOM_API_SECRET || ''

  const zoom = new ZoomIntegration(apiKey, apiSecret)

  return {
    createMeeting: zoom.createMeeting.bind(zoom),
    getMeeting: zoom.getMeeting.bind(zoom),
    updateMeeting: zoom.updateMeeting.bind(zoom),
    deleteMeeting: zoom.deleteMeeting.bind(zoom),
    getRecordings: zoom.getRecordings.bind(zoom),
    getParticipants: zoom.getParticipants.bind(zoom),
    getStartUrl: zoom.getStartUrl.bind(zoom),
    getJoinUrl: zoom.getJoinUrl.bind(zoom),
    generatePassword: zoom.generatePassword.bind(zoom)
  }
}

export default ZoomIntegration
