'use client'

import { useState, useEffect } from 'react'

// Google Meet API Integration Wrapper
// This component provides functions to interact with Google Calendar API to create Meet links

interface GoogleMeetSettings {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{ email: string }>
  conferenceData?: {
    createRequest: {
      requestId: string
      conferenceSolutionKey: {
        type: string
      }
    }
  }
}

interface GoogleMeetEvent {
  id: string
  summary: string
  description?: string
  start: any
  end: any
  hangoutLink?: string
  conferenceData?: any
  htmlLink: string
}

export class GoogleMeetIntegration {
  private accessToken: string
  private baseUrl: string = 'https://www.googleapis.com/calendar/v3'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  // Create a new Google Meet meeting via Calendar API
  async createMeeting(calendarId: string, settings: GoogleMeetSettings): Promise<GoogleMeetEvent> {
    try {
      // Add conference data to create Meet link
      const eventData = {
        ...settings,
        conferenceData: {
          createRequest: {
            requestId: this.generateRequestId(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }

      const response = await fetch(
        `${this.baseUrl}/calendars/${calendarId}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify(eventData)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create Google Meet meeting')
      }

      const event = await response.json()
      return event
    } catch (error) {
      console.error('Google Meet create meeting error:', error)
      throw error
    }
  }

  // Get meeting details
  async getMeeting(calendarId: string, eventId: string): Promise<GoogleMeetEvent> {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get Google Meet meeting')
      }

      const event = await response.json()
      return event
    } catch (error) {
      console.error('Google Meet get meeting error:', error)
      throw error
    }
  }

  // Update meeting
  async updateMeeting(
    calendarId: string,
    eventId: string,
    settings: Partial<GoogleMeetSettings>
  ): Promise<GoogleMeetEvent> {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify(settings)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update Google Meet meeting')
      }

      const event = await response.json()
      return event
    } catch (error) {
      console.error('Google Meet update meeting error:', error)
      throw error
    }
  }

  // Delete meeting
  async deleteMeeting(calendarId: string, eventId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete Google Meet meeting')
      }
    } catch (error) {
      console.error('Google Meet delete meeting error:', error)
      throw error
    }
  }

  // Get meeting link
  getMeetingLink(event: GoogleMeetEvent): string | null {
    return event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null
  }

  // Get meeting ID
  getMeetingId(event: GoogleMeetEvent): string | null {
    return event.conferenceData?.conferenceId || null
  }

  // List upcoming meetings
  async listMeetings(calendarId: string, timeMin?: string, timeMax?: string): Promise<GoogleMeetEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: timeMin || new Date().toISOString(),
        ...(timeMax && { timeMax }),
        singleEvents: 'true',
        orderBy: 'startTime'
      })

      const response = await fetch(
        `${this.baseUrl}/calendars/${calendarId}/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to list Google Meet meetings')
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Google Meet list meetings error:', error)
      throw error
    }
  }

  // Generate unique request ID for conference creation
  private generateRequestId(): string {
    return `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get recordings from Google Drive (if recorded)
  async getRecordings(driveFileId: string): Promise<any> {
    try {
      // Note: Google Meet recordings are saved to Google Drive
      // This requires Drive API access
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${driveFileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get recording from Google Drive')
      }

      const file = await response.json()
      return file
    } catch (error) {
      console.error('Google Meet get recording error:', error)
      throw error
    }
  }
}

// Hook for using Google Meet integration
export function useGoogleMeetIntegration() {
  const [accessToken, setAccessToken] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch access token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/google-meet/token')
        const data = await response.json()

        if (!response.ok || !data.connected) {
          throw new Error('Google Meet not connected')
        }

        // Token is validated on the server, we just need to know it exists
        setIsReady(true)
      } catch (err) {
        console.error('Error fetching Google Meet token:', err)
        setError(err instanceof Error ? err.message : 'Failed to get access token')
        setIsReady(false)
      }
    }

    fetchToken()
  }, [])

  // Create meeting through API endpoint instead of direct client call
  const createMeeting = async (calendarId: string, settings: GoogleMeetSettings) => {
    const response = await fetch('/api/google-meet/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, settings })
    })

    if (!response.ok) {
      throw new Error('Failed to create meeting')
    }

    return response.json()
  }

  const getMeeting = async (calendarId: string, eventId: string) => {
    const response = await fetch(`/api/google-meet/meetings/${eventId}?calendarId=${calendarId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get meeting')
    }

    return response.json()
  }

  const updateMeeting = async (calendarId: string, eventId: string, settings: Partial<GoogleMeetSettings>) => {
    const response = await fetch(`/api/google-meet/meetings/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, settings })
    })

    if (!response.ok) {
      throw new Error('Failed to update meeting')
    }

    return response.json()
  }

  const deleteMeeting = async (calendarId: string, eventId: string) => {
    const response = await fetch(`/api/google-meet/meetings/${eventId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId })
    })

    if (!response.ok) {
      throw new Error('Failed to delete meeting')
    }
  }

  const listMeetings = async (calendarId: string, timeMin?: string, timeMax?: string) => {
    const params = new URLSearchParams({
      calendarId,
      ...(timeMin && { timeMin }),
      ...(timeMax && { timeMax })
    })

    const response = await fetch(`/api/google-meet/meetings?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to list meetings')
    }

    const data = await response.json()
    return data.items || []
  }

  return {
    isReady,
    error,
    createMeeting,
    getMeeting,
    updateMeeting,
    deleteMeeting,
    listMeetings,
    getMeetingLink: (event: GoogleMeetEvent) => 
      event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null,
    getMeetingId: (event: GoogleMeetEvent) => 
      event.conferenceData?.conferenceId || null
  }
}

export default GoogleMeetIntegration
