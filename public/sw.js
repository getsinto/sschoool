// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title || 'New Notification';
  const options = {
    body: data.message || data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.action_url || data.url || '/',
      notificationId: data.id
    },
    tag: data.tag || 'notification',
    requireInteraction: data.priority === 'urgent',
    vibrate: data.priority === 'urgent' ? [200, 100, 200] : [100],
    actions: data.action_url ? [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ] : []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
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

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Fetch pending notifications when back online
    const response = await fetch('/api/notifications?limit=10');
    const data = await response.json();
    
    // You can process or cache these notifications
    console.log('Synced notifications:', data);
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}
