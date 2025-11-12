// React Hook for Google Meet Integration
import { useState, useEffect, useCallback } from 'react';

interface GoogleMeetStatus {
  configured: boolean;
  connected: boolean;
  integration: {
    connected: boolean;
    scopes: string[];
    expiresAt: string;
  } | null;
}

interface GoogleMeeting {
  eventId: string;
  title: string;
  start: string;
  end: string;
  meetLink: string;
  status: string;
  attendees: number;
}

export function useGoogleMeet() {
  const [status, setStatus] = useState<GoogleMeetStatus | null>(null);
  const [meetings, setMeetings] = useState<GoogleMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check Google Meet connection status
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-meet/status');
      if (!response.ok) throw new Error('Failed to check status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to Google Meet
  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-meet/auth', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to initiate connection');
      const data = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setLoading(false);
    }
  }, []);

  // Disconnect from Google Meet
  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-meet/disconnect', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to disconnect');
      
      await checkStatus();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  // List upcoming meetings
  const listMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-meet/meetings');
      if (!response.ok) throw new Error('Failed to list meetings');
      const data = await response.json();
      setMeetings(data.meetings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a meeting
  const createMeeting = useCallback(async (meetingData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: string[];
    timezone?: string;
    live_class_id?: string;
  }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-meet/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
      });
      
      if (!response.ok) throw new Error('Failed to create meeting');
      const data = await response.json();
      setError(null);
      return data.meeting;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create meeting';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a meeting
  const updateMeeting = useCallback(async (
    eventId: string,
    updates: {
      title?: string;
      description?: string;
      start_time?: string;
      end_time?: string;
      attendees?: string[];
      timezone?: string;
    }
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/google-meet/meetings/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update meeting');
      const data = await response.json();
      setError(null);
      return data.meeting;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update meeting';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a meeting
  const deleteMeeting = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/google-meet/meetings/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete meeting');
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete meeting';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get meeting details
  const getMeeting = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/google-meet/meetings/${eventId}`);
      if (!response.ok) throw new Error('Failed to get meeting');
      const data = await response.json();
      setError(null);
      return data.meeting;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get meeting';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    meetings,
    loading,
    error,
    connect,
    disconnect,
    checkStatus,
    listMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeeting
  };
}
