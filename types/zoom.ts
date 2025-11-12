// Zoom Integration Types

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  host_email: string;
  topic: string;
  type: 1 | 2 | 3 | 8; // 1=instant, 2=scheduled, 3=recurring no fixed, 8=recurring fixed
  status: 'waiting' | 'started' | 'finished';
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
  settings: ZoomMeetingSettings;
  pre_schedule: boolean;
}

export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  cn_meeting?: boolean;
  in_meeting?: boolean;
  join_before_host?: boolean;
  jbh_time?: number;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: 0 | 1 | 2;
  registration_type?: 1 | 2 | 3;
  audio?: 'both' | 'telephony' | 'voip';
  auto_recording?: 'local' | 'cloud' | 'none';
  enforce_login?: boolean;
  enforce_login_domains?: string;
  alternative_hosts?: string;
  close_registration?: boolean;
  show_share_button?: boolean;
  allow_multiple_devices?: boolean;
  registrants_confirmation_email?: boolean;
  waiting_room?: boolean;
  request_permission_to_unmute_participants?: boolean;
  registrants_email_notification?: boolean;
  meeting_authentication?: boolean;
  encryption_type?: 'enhanced_encryption' | 'e2ee';
  approved_or_denied_countries_or_regions?: {
    enable?: boolean;
    method?: 'approve' | 'deny';
    approved_list?: string[];
    denied_list?: string[];
  };
  breakout_room?: {
    enable?: boolean;
    rooms?: Array<{
      name?: string;
      participants?: string[];
    }>;
  };
  alternative_hosts_email_notification?: boolean;
  show_join_info?: boolean;
  device_testing?: boolean;
  focus_mode?: boolean;
  enable_dedicated_group_chat?: boolean;
  private_meeting?: boolean;
  email_notification?: boolean;
  host_save_video_order?: boolean;
  sign_language_interpretation?: {
    enable?: boolean;
    interpreters?: Array<{
      email?: string;
      languages?: string;
    }>;
  };
}

export interface ZoomRecording {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: 'MP4' | 'M4A' | 'TIMELINE' | 'TRANSCRIPT' | 'CHAT' | 'CC';
  file_extension: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: 'completed' | 'processing';
  recording_type: string;
}

export interface ZoomParticipant {
  id: string;
  user_id: string;
  name: string;
  user_email: string;
  join_time: string;
  leave_time: string;
  duration: number;
  attentiveness_score?: string;
  failover?: boolean;
  status?: 'in_meeting' | 'in_waiting_room';
}

export interface ZoomWebhookEvent {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      id: string | number;
      uuid?: string;
      host_id?: string;
      topic?: string;
      type?: number;
      start_time?: string;
      duration?: number;
      timezone?: string;
      participant?: {
        id?: string;
        user_id?: string;
        user_name?: string;
        email?: string;
        join_time?: string;
        leave_time?: string;
        duration?: number;
      };
      recording_files?: ZoomRecording[];
    };
  };
}

export interface AttendanceRecord {
  class_id: string;
  student_id: string;
  meeting_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  join_time?: string;
  leave_time?: string;
  duration: number;
  recorded_at: string;
}

export interface AttendanceStats {
  total_participants: number;
  on_time: number;
  late: number;
  left_early: number;
  full_attendance: number;
  average_duration: number;
  attendance_rate: number;
}

export interface AttendanceReport {
  meeting_id: string;
  meeting_uuid: string;
  topic: string;
  start_time: string;
  end_time: string;
  duration: number;
  participants: ZoomParticipant[];
  total_participants: number;
  stats?: AttendanceStats;
}

export interface ZoomSDKConfig {
  sdkKey: string;
  signature: string;
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail?: string;
  role: 0 | 1; // 0 = participant, 1 = host
  leaveUrl?: string;
  success?: (success: any) => void;
  error?: (error: any) => void;
}

export interface CreateMeetingRequest {
  topic: string;
  type?: 1 | 2 | 3 | 8;
  start_time?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: Partial<ZoomMeetingSettings>;
  recurrence?: {
    type: 1 | 2 | 3;
    repeat_interval: number;
    weekly_days?: string;
    monthly_day?: number;
    monthly_week?: number;
    monthly_week_day?: number;
    end_times?: number;
    end_date_time?: string;
  };
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  schedule_for?: string;
}

export interface JoinMeetingOptions {
  meetingId: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  role?: 0 | 1;
  embedded?: boolean;
}

export interface RecordingProcessResult {
  recording_url: string;
  thumbnail_url?: string;
  duration: number;
  file_size: number;
  processed_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_email?: string;
  user_name?: string;
  participant_id?: string;
  join_time?: string;
  leave_time?: string;
  duration: number;
  created_at: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  teacher_id: string;
  meeting_id?: string;
  meeting_password?: string;
  join_url?: string;
  start_url?: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  recording_url?: string;
  recording_duration?: number;
  recording_processed_at?: string;
  attendance_synced: boolean;
  attendance_synced_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
}
