// Zoom Utility Functions

/**
 * Format meeting duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${mins} min`;
}

/**
 * Check if meeting is starting soon (within 15 minutes)
 */
export function isMeetingStartingSoon(scheduledAt: string): boolean {
  const meetingTime = new Date(scheduledAt).getTime();
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  return meetingTime - now <= fifteenMinutes && meetingTime > now;
}

/**
 * Check if meeting is currently live
 */
export function isMeetingLive(scheduledAt: string, duration: number): boolean {
  const meetingStart = new Date(scheduledAt).getTime();
  const meetingEnd = meetingStart + (duration * 60 * 1000);
  const now = Date.now();
  
  return now >= meetingStart && now <= meetingEnd;
}

/**
 * Check if meeting has ended
 */
export function hasMeetingEnded(scheduledAt: string, duration: number): boolean {
  const meetingEnd = new Date(scheduledAt).getTime() + (duration * 60 * 1000);
  return Date.now() > meetingEnd;
}

/**
 * Get meeting status based on time
 */
export function getMeetingStatus(scheduledAt: string, duration: number): 'upcoming' | 'live' | 'ended' {
  if (hasMeetingEnded(scheduledAt, duration)) {
    return 'ended';
  }
  
  if (isMeetingLive(scheduledAt, duration)) {
    return 'live';
  }
  
  return 'upcoming';
}

/**
 * Format meeting time for display
 */
export function formatMeetingTime(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get time until meeting starts
 */
export function getTimeUntilMeeting(scheduledAt: string): string {
  const meetingTime = new Date(scheduledAt).getTime();
  const now = Date.now();
  const diff = meetingTime - now;
  
  if (diff < 0) {
    return 'Started';
  }
  
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  if (minutes > 0) {
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  return 'Starting now';
}

/**
 * Validate meeting password
 */
export function isValidMeetingPassword(password: string): boolean {
  // Zoom password requirements:
  // - 1-10 characters
  // - Only alphanumeric and @-_*
  const regex = /^[a-zA-Z0-9@\-_*]{1,10}$/;
  return regex.test(password);
}

/**
 * Generate meeting topic from course and date
 */
export function generateMeetingTopic(courseTitle: string, date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  return `${courseTitle} - ${dateStr}`;
}

/**
 * Parse Zoom meeting ID from various formats
 */
export function parseMeetingId(input: string): string {
  // Remove spaces and dashes
  return input.replace(/[\s-]/g, '');
}

/**
 * Format meeting ID for display (with spaces)
 */
export function formatMeetingId(meetingId: string): string {
  // Format as XXX XXXX XXXX
  const cleaned = parseMeetingId(meetingId);
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return cleaned;
}

/**
 * Get meeting join URL with password embedded
 */
export function getMeetingJoinUrlWithPassword(joinUrl: string, password?: string): string {
  if (!password) {
    return joinUrl;
  }
  
  const url = new URL(joinUrl);
  url.searchParams.set('pwd', password);
  
  return url.toString();
}

/**
 * Extract meeting ID from join URL
 */
export function extractMeetingIdFromUrl(joinUrl: string): string | null {
  try {
    const url = new URL(joinUrl);
    const pathParts = url.pathname.split('/');
    const meetingId = pathParts[pathParts.length - 1];
    
    return parseMeetingId(meetingId);
  } catch {
    return null;
  }
}

/**
 * Check if user can join meeting (based on time)
 */
export function canJoinMeeting(
  scheduledAt: string,
  duration: number,
  joinBeforeMinutes: number = 10
): boolean {
  const meetingStart = new Date(scheduledAt).getTime();
  const meetingEnd = meetingStart + (duration * 60 * 1000);
  const now = Date.now();
  const joinWindow = joinBeforeMinutes * 60 * 1000;
  
  return now >= (meetingStart - joinWindow) && now <= meetingEnd;
}

/**
 * Get meeting color based on status
 */
export function getMeetingStatusColor(status: string): string {
  switch (status) {
    case 'live':
      return 'green';
    case 'scheduled':
    case 'upcoming':
      return 'blue';
    case 'ended':
      return 'gray';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Calculate total meeting time in a period
 */
export function calculateTotalMeetingTime(meetings: Array<{ duration: number }>): number {
  return meetings.reduce((total, meeting) => total + meeting.duration, 0);
}

/**
 * Group meetings by date
 */
export function groupMeetingsByDate(meetings: Array<{ scheduledAt: string; [key: string]: any }>) {
  const grouped: Record<string, any[]> = {};
  
  meetings.forEach(meeting => {
    const date = new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    
    grouped[date].push(meeting);
  });
  
  return grouped;
}
