'use client';

import { useState, useEffect } from 'react';

interface ZoomMeetingState {
  isLoading: boolean;
  error: string | null;
  meetingData: any | null;
}

export function useZoomMeeting(meetingId: string | null) {
  const [state, setState] = useState<ZoomMeetingState>({
    isLoading: false,
    error: null,
    meetingData: null
  });

  useEffect(() => {
    if (!meetingId) return;

    const fetchMeetingData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await fetch(`/api/zoom/meeting/${meetingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting data');
        }

        const data = await response.json();
        setState({
          isLoading: false,
          error: null,
          meetingData: data
        });
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          meetingData: null
        });
      }
    };

    fetchMeetingData();
  }, [meetingId]);

  const createMeeting = async (meetingData: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/zoom/create-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      setState({
        isLoading: false,
        error: null,
        meetingData: data
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const updateMeeting = async (meetingId: string, updates: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/zoom/update-meeting/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const deleteMeeting = async (meetingId: string, sendNotification = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `/api/zoom/delete-meeting/${meetingId}?notify=${sendNotification}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      setState({
        isLoading: false,
        error: null,
        meetingData: null
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const startRecording = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/zoom/recording/start/${meetingId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  };

  const stopRecording = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/zoom/recording/stop/${meetingId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to stop recording');
      }

      return await response.json();
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  };

  return {
    ...state,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    startRecording,
    stopRecording
  };
}
