/**
 * Service Worker for Push Notifications
 */

// Service Worker version
const CACHE_VERSION = 'v1';
const CACHE_NAME = `lms-cache-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: {},
    tag: 'notification',
    requireInteraction: false,
    actions: []
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions || [],
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle action button clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    
    if (event.action === 'dismiss') {
      return;
    }

    // Handle other actions
    const actionUrl = getActionUrl(event.action, event.notification.data);
    if (actionUrl) {
      event.waitUntil(
        clients.openWindow(actionUrl)
      );
    }
    return;
  }

  // Handle notification body click
  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  const notificationData = event.notification.data;
  if (notificationData?.trackDismissal) {
    event.waitUntil(
      fetch('/api/notifications/track-dismissal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: notificationData.notificationId,
          dismissedAt: new Date().toISOString()
        })
      })
    );
  }
});

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Helper function to get action URL
function getActionUrl(action, data) {
  const baseUrl = self.location.origin;
  
  switch (action) {
    case 'join':
      return data?.meetingLink || `${baseUrl}/live-classes`;
    case 'view':
      return data?.url || `${baseUrl}/notifications`;
    default:
      return `${baseUrl}/notifications`;
  }
}

// Helper function to sync notifications
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    
    console.log('Notifications synced successfully');
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Message event - handle messages from the client
self.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Fetch event - handle network requests (optional caching strategy)
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Network-first strategy for other requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request);
      })
  );
});
