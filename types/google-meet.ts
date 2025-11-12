// Google Meet TypeScript Type Definitions

export interface GoogleMeetCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface GoogleMeetEvent {
  eventId: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  meetLink: string;
  calendarLink: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees: GoogleMeetAttendee[];
  created: string;
  updated: string;
}

export interface GoogleMeetAttendee {
  email: string;
  displayName?: string;
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
}

export interface CreateGoogleMeetParams {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  attendees?: string[];
  sendUpdates?: boolean;
  reminders?: {
    email?: number; // minutes before
    popup?: number; // minutes before
  };
}

export interface UpdateGoogleMeetParams {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  attendees?: string[];
  sendUpdates?: boolean;
}

export interface GoogleMeetIntegration {
  id: string;
  user_id: string;
  provider: 'google';
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  scopes: string;
  is_active: boolean;
  calendar_id?: string;
  calendar_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleCalendarInfo {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  accessRole: string;
  primary?: boolean;
}

export interface GoogleMeetSettings {
  defaultReminders: {
    email: number;
    popup: number;
  };
  autoCreateMeet: boolean;
  allowGuestsToModify: boolean;
  allowGuestsToInviteOthers: boolean;
  allowGuestsToSeeOtherGuests: boolean;
  sendUpdates: 'all' | 'externalOnly' | 'none';
}

export interface GoogleMeetJoinInfo {
  meetLink: string;
  phoneNumbers?: {
    number: string;
    pin: string;
  }[];
  sipInfo?: {
    uri: string;
    pin: string;
  };
}

// Platform comparison types
export type VideoConferencePlatform = 'zoom' | 'google_meet';

export interface PlatformCapabilities {
  maxParticipants: number;
  maxDuration: number; // in minutes, 0 = unlimited
  hasWaitingRoom: boolean;
  hasPassword: boolean;
  hasRecording: boolean;
  hasBreakoutRooms: boolean;
  hasPolls: boolean;
  hasWhiteboard: boolean;
  hasAttendanceAPI: boolean;
  requiresSubscription: boolean;
}

export interface LiveClassPlatformData {
  platform: VideoConferencePlatform;
  meeting_id?: string; // Zoom meeting ID
  google_event_id?: string; // Google Calendar event ID
  join_url: string;
  start_url?: string; // For Zoom hosts
  password?: string; // For Zoom
  platform_data?: Record<string, any>; // Platform-specific data
}
