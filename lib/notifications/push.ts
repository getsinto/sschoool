/**
 * Web Push Notifications Library
 * Handles push notification subscriptions and sending
 */

import webpush from 'web-push';

// VAPID configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@lms.com';

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured');
      return false;
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/notification-icon.png',
      badge: payload.badge || '/icons/badge-icon.png',
      data: payload.data || {},
      tag: payload.tag || 'notification',
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || []
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      },
      pushPayload
    );

    return true;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // Handle specific errors
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or not found
      console.log('Subscription expired, should be removed from database');
    }
    
    return false;
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    subscriptions.map(subscription => 
      sendPushNotification(subscription, payload)
    )
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - success;

  return { success, failed };
}

/**
 * Validate push subscription
 */
export function validatePushSubscription(subscription: any): boolean {
  return !!(
    subscription &&
    subscription.endpoint &&
    subscription.keys &&
    subscription.keys.p256dh &&
    subscription.keys.auth
  );
}

/**
 * Generate VAPID keys (for setup only)
 * Run this once to generate keys and add to environment variables
 */
export function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  return {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
  };
}

/**
 * Client-side: Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers not supported');
      return null;
    }

    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      console.error('Push notifications not supported');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Convert to our format
    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    return pushSubscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Client-side: Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Client-side: Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return null;
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

/**
 * Client-side: Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Client-side: Check notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Convert URL-safe base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Test push notification
 */
export async function sendTestPushNotification(
  subscription: PushSubscription
): Promise<boolean> {
  return await sendPushNotification(subscription, {
    title: 'Test Notification',
    body: 'This is a test push notification from your LMS!',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });
}
