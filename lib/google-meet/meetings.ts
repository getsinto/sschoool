// Google Meet Meetings Management
// Create, update, delete meetings via Google Calendar API
import { getAuthenticatedClient } from './auth';

interface CreateMeetingParams {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[]; // Email addresses
  timezone?: string;
  sendUpdates?: boolean;
}

interface UpdateMeetingParams {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  attendees?: string[];
  timezone?: string;
}

interface GoogleMeetingResponse {
  eventId: string;
  meetLink: string;
  calendarLink: string;
  status: string;
}

/**
 * Create a Google Meet meeting via Calendar API
 */
export async function createMeeting(
  userId: string,
  params: CreateMeetingParams
): Promise<GoogleMeetingResponse> {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    const event = {
      summary: params.title,
      description: params.description || '',
      start: {
        dateTime: params.start_time,
        timeZone: params.timezone || 'UTC',
      },
      end: {
        dateTime: params.end_time,
        timeZone: params.timezone || 'UTC',
      },
      attendees: params.attendees?.map(email => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: client.generateRequestId(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours
          { method: 'popup', minutes: 30 }, // 30 minutes
        ],
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
      sendUpdates: params.sendUpdates ? 'all' : 'none',
    });

    const eventData = response.data;
    
    return {
      eventId: eventData.id!,
      meetLink: eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri || '',
      calendarLink: eventData.htmlLink || '',
      status: eventData.status || 'confirmed'
    };
  } catch (error) {
    console.error('Error creating Google Meet meeting:', error);
    throw new Error('Failed to create meeting');
  }
}

/**
 * Update a Google Meet meeting
 */
export async function updateMeeting(
  userId: string,
  eventId: string,
  params: UpdateMeetingParams
): Promise<GoogleMeetingResponse> {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    // First get the existing event
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    const event = existingEvent.data;

    // Update only provided fields
    const updateData: any = {};
    
    if (params.title) updateData.summary = params.title;
    if (params.description !== undefined) updateData.description = params.description;
    
    if (params.start_time) {
      updateData.start = {
        dateTime: params.start_time,
        timeZone: params.timezone || event.start?.timeZone || 'UTC',
      };
    }
    
    if (params.end_time) {
      updateData.end = {
        dateTime: params.end_time,
        timeZone: params.timezone || event.end?.timeZone || 'UTC',
      };
    }
    
    if (params.attendees) {
      updateData.attendees = params.attendees.map(email => ({ email }));
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });

    const eventData = response.data;
    
    return {
      eventId: eventData.id!,
      meetLink: eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri || '',
      calendarLink: eventData.htmlLink || '',
      status: eventData.status || 'confirmed'
    };
  } catch (error) {
    console.error('Error updating Google Meet meeting:', error);
    throw new Error('Failed to update meeting');
  }
}

/**
 * Delete a Google Meet meeting
 */
export async function deleteMeeting(
  userId: string,
  eventId: string,
  sendUpdates: boolean = true
): Promise<void> {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: sendUpdates ? 'all' : 'none',
    });
  } catch (error) {
    console.error('Error deleting Google Meet meeting:', error);
    throw new Error('Failed to delete meeting');
  }
}

/**
 * Get meeting details
 */
export async function getMeeting(
  userId: string,
  eventId: string
): Promise<GoogleMeetingResponse & { attendees: string[] }> {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    const event = response.data;
    
    return {
      eventId: event.id!,
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
      calendarLink: event.htmlLink || '',
      status: event.status || 'confirmed',
      attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || []
    };
  } catch (error) {
    console.error('Error getting Google Meet meeting:', error);
    throw new Error('Failed to get meeting');
  }
}

/**
 * List user's upcoming meetings
 */
export async function listUpcomingMeetings(
  userId: string,
  maxResults: number = 10
) {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'meet.google.com', // Filter for Meet meetings
    });

    return response.data.items?.map((event: any) => ({
      eventId: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
      status: event.status,
      attendees: event.attendees?.length || 0
    })) || [];
  } catch (error) {
    console.error('Error listing meetings:', error);
    throw new Error('Failed to list meetings');
  }
}

/**
 * Check if meeting time conflicts with existing events
 */
export async function checkTimeConflict(
  userId: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string
): Promise<boolean> {
  try {
    const client = await getAuthenticatedClient(userId);
    const calendar = client.getCalendar();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
    });

    const conflicts = response.data.items?.filter((event: any) => 
      event.id !== excludeEventId && event.status !== 'cancelled'
    ) || [];
    
    return conflicts.length > 0;
  } catch (error) {
    console.error('Error checking time conflict:', error);
    return false; // Assume no conflict if check fails
  }
}
