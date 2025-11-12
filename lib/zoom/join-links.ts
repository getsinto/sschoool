// Zoom Join Link Generation
import { zoomClient } from './client';

export interface JoinLinkOptions {
  meetingId: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  role?: 0 | 1; // 0 = participant, 1 = host
}

// Generate host join URL
export function generateHostJoinUrl(
  meetingId: string,
  password?: string
): string {
  const baseUrl = 'https://zoom.us/s';
  let url = `${baseUrl}/${meetingId}`;
  
  if (password) {
    url += `?pwd=${password}`;
  }
  
  return url;
}

// Generate participant join URL
export function generateParticipantJoinUrl(
  meetingId: string,
  userName?: string,
  userEmail?: string,
  password?: string
): string {
  const baseUrl = 'https://zoom.us/j';
  let url = `${baseUrl}/${meetingId}`;
  
  const params = new URLSearchParams();
  
  if (password) {
    params.append('pwd', password);
  }
  
  if (userName) {
    params.append('uname', userName);
  }
  
  if (userEmail) {
    params.append('email', userEmail);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

// Generate join URL with embedded password
export function generateJoinUrlWithPassword(
  meetingId: string,
  password: string
): string {
  return `https://zoom.us/j/${meetingId}?pwd=${password}`;
}

// Generate Web SDK join URL
export function generateWebSDKJoinUrl(
  meetingId: string,
  password?: string,
  userName?: string
): string {
  const params = new URLSearchParams({
    meetingNumber: meetingId,
    ...(password && { password }),
    ...(userName && { userName })
  });
  
  return `/zoom/join?${params.toString()}`;
}

// Generate SDK signature for joining
export function generateSDKSignature(
  meetingNumber: string,
  role: 0 | 1
): string {
  return zoomClient.generateSignature(meetingNumber, role);
}

// Generate JWT token for SDK
export function generateSDKJWT(
  meetingNumber: string,
  role: 0 | 1
): string {
  return zoomClient.generateJWT(meetingNumber, role);
}

// Parse Zoom join URL to extract meeting ID and password
export function parseJoinUrl(joinUrl: string): {
  meetingId: string;
  password?: string;
} | null {
  try {
    const url = new URL(joinUrl);
    const pathParts = url.pathname.split('/');
    const meetingId = pathParts[pathParts.length - 1];
    const password = url.searchParams.get('pwd') || undefined;
    
    return {
      meetingId,
      password
    };
  } catch (error) {
    console.error('Error parsing Zoom join URL:', error);
    return null;
  }
}

// Generate one-click join link (no password prompt)
export function generateOneClickJoinUrl(
  meetingId: string,
  encryptedPassword: string
): string {
  return `https://zoom.us/wc/join/${meetingId}?pwd=${encryptedPassword}`;
}

// Generate mobile join URL
export function generateMobileJoinUrl(
  meetingId: string,
  password?: string
): {
  ios: string;
  android: string;
} {
  const baseIOS = 'zoomus://zoom.us/join';
  const baseAndroid = 'zoomus://zoom.us/join';
  
  const params = new URLSearchParams({
    confno: meetingId,
    ...(password && { pwd: password })
  });
  
  return {
    ios: `${baseIOS}?${params.toString()}`,
    android: `${baseAndroid}?${params.toString()}`
  };
}

// Generate calendar invite URL
export function generateCalendarInviteUrl(
  meetingId: string,
  topic: string,
  startTime: string,
  duration: number,
  joinUrl: string
): {
  google: string;
  outlook: string;
  ical: string;
} {
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const description = `Join Zoom Meeting: ${joinUrl}`;
  
  // Google Calendar
  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: topic,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
    location: 'Zoom Meeting'
  });
  
  // Outlook
  const outlookParams = new URLSearchParams({
    subject: topic,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: description,
    location: 'Zoom Meeting'
  });
  
  return {
    google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`,
    ical: `/api/zoom/calendar/${meetingId}.ics`
  };
}

// Generate embed URL for iframe
export function generateEmbedUrl(
  meetingId: string,
  password?: string,
  userName?: string
): string {
  const params = new URLSearchParams({
    meetingNumber: meetingId,
    ...(password && { password }),
    ...(userName && { userName }),
    embed: 'true'
  });
  
  return `/zoom/embed?${params.toString()}`;
}
