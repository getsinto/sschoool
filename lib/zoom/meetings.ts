// Zoom Meetings Management
import { zoomClient } from './client';

export interface CreateMeetingParams {
  topic: string;
  type?: 1 | 2 | 3 | 8; // 1=instant, 2=scheduled, 3=recurring no fixed time, 8=recurring fixed time
  start_time?: string; // ISO 8601 format
  duration?: number; // minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: 0 | 1 | 2; // 0=auto, 1=manual, 2=no registration
    registration_type?: 1 | 2 | 3;
    audio?: 'both' | 'telephony' | 'voip';
    auto_recording?: 'local' | 'cloud' | 'none';
    waiting_room?: boolean;
    allow_multiple_devices?: boolean;
    meeting_authentication?: boolean;
    enable_dedicated_group_chat?: boolean;
  };
  recurrence?: {
    type: 1 | 2 | 3; // 1=daily, 2=weekly, 3=monthly
    repeat_interval: number;
    weekly_days?: string; // "1,2,3,4,5" for Mon-Fri
    monthly_day?: number;
    monthly_week?: number;
    monthly_week_day?: number;
    end_times?: number;
    end_date_time?: string;
  };
}

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  host_email: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings: any;
  pre_schedule: boolean;
}

export interface UpdateMeetingParams extends Partial<CreateMeetingParams> {
  schedule_for?: string;
}

// Create a new Zoom meeting
export async function createMeeting(
  userId: string = 'me',
  params: CreateMeetingParams
): Promise<ZoomMeeting> {
  try {
    const meetingData = {
      topic: params.topic,
      type: params.type || 2, // Default to scheduled meeting
      start_time: params.start_time,
      duration: params.duration || 60,
      timezone: params.timezone || 'UTC',
      password: params.password,
      agenda: params.agenda,
      settings: {
        host_video: params.settings?.host_video ?? true,
        participant_video: params.settings?.participant_video ?? true,
        join_before_host: params.settings?.join_before_host ?? false,
        mute_upon_entry: params.settings?.mute_upon_entry ?? true,
        watermark: params.settings?.watermark ?? false,
        use_pmi: params.settings?.use_pmi ?? false,
        approval_type: params.settings?.approval_type ?? 0,
        audio: params.settings?.audio || 'both',
        auto_recording: params.settings?.auto_recording || 'cloud',
        waiting_room: params.settings?.waiting_room ?? true,
        allow_multiple_devices: params.settings?.allow_multiple_devices ?? true,
        meeting_authentication: params.settings?.meeting_authentication ?? false,
        ...params.settings
      },
      recurrence: params.recurrence
    };

    const meeting = await zoomClient.request<ZoomMeeting>(
      `/users/${userId}/meetings`,
      {
        method: 'POST',
        body: JSON.stringify(meetingData)
      }
    );

    return meeting;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw error;
  }
}

// Get meeting details
export async function getMeeting(meetingId: string): Promise<ZoomMeeting> {
  try {
    const meeting = await zoomClient.request<ZoomMeeting>(
      `/meetings/${meetingId}`
    );
    return meeting;
  } catch (error) {
    console.error('Error fetching Zoom meeting:', error);
    throw error;
  }
}

// Update meeting
export async function updateMeeting(
  meetingId: string,
  params: UpdateMeetingParams
): Promise<void> {
  try {
    await zoomClient.request(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(params)
    });
  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    throw error;
  }
}

// Delete meeting
export async function deleteMeeting(
  meetingId: string,
  options?: {
    occurrence_id?: string;
    schedule_for_reminder?: boolean;
    cancel_meeting_reminder?: boolean;
  }
): Promise<void> {
  try {
    const queryParams = new URLSearchParams();
    if (options?.occurrence_id) {
      queryParams.append('occurrence_id', options.occurrence_id);
    }
    if (options?.schedule_for_reminder) {
      queryParams.append('schedule_for_reminder', 'true');
    }
    if (options?.cancel_meeting_reminder) {
      queryParams.append('cancel_meeting_reminder', 'true');
    }

    const query = queryParams.toString();
    await zoomClient.request(
      `/meetings/${meetingId}${query ? `?${query}` : ''}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    throw error;
  }
}

// List meetings for a user
export async function listMeetings(
  userId: string = 'me',
  type: 'scheduled' | 'live' | 'upcoming' = 'scheduled',
  pageSize: number = 30,
  pageNumber: number = 1
): Promise<{ meetings: ZoomMeeting[]; page_count: number; page_size: number; total_records: number }> {
  try {
    const response = await zoomClient.request<any>(
      `/users/${userId}/meetings?type=${type}&page_size=${pageSize}&page_number=${pageNumber}`
    );
    return response;
  } catch (error) {
    console.error('Error listing Zoom meetings:', error);
    throw error;
  }
}

// End a meeting
export async function endMeeting(meetingId: string): Promise<void> {
  try {
    await zoomClient.request(`/meetings/${meetingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'end' })
    });
  } catch (error) {
    console.error('Error ending Zoom meeting:', error);
    throw error;
  }
}

// Get meeting invitation
export async function getMeetingInvitation(meetingId: string): Promise<string> {
  try {
    const response = await zoomClient.request<{ invitation: string }>(
      `/meetings/${meetingId}/invitation`
    );
    return response.invitation;
  } catch (error) {
    console.error('Error getting meeting invitation:', error);
    throw error;
  }
}

// Add meeting registrant
export async function addRegistrant(
  meetingId: string,
  registrant: {
    email: string;
    first_name: string;
    last_name?: string;
    address?: string;
    city?: string;
    country?: string;
    zip?: string;
    state?: string;
    phone?: string;
    industry?: string;
    org?: string;
    job_title?: string;
    purchasing_time_frame?: string;
    role_in_purchase_process?: string;
    no_of_employees?: string;
    comments?: string;
  }
): Promise<any> {
  try {
    const response = await zoomClient.request(
      `/meetings/${meetingId}/registrants`,
      {
        method: 'POST',
        body: JSON.stringify(registrant)
      }
    );
    return response;
  } catch (error) {
    console.error('Error adding meeting registrant:', error);
    throw error;
  }
}

// List meeting registrants
export async function listRegistrants(
  meetingId: string,
  status: 'pending' | 'approved' | 'denied' = 'approved',
  pageSize: number = 30
): Promise<any> {
  try {
    const response = await zoomClient.request(
      `/meetings/${meetingId}/registrants?status=${status}&page_size=${pageSize}`
    );
    return response;
  } catch (error) {
    console.error('Error listing meeting registrants:', error);
    throw error;
  }
}
