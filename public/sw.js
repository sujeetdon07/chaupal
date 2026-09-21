const CACHE_NAME = 'chaupal-radio-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Keep service worker alive with periodic sync
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    // Respond to keep the service worker active
    event.ports[0].postMessage({ status: 'alive' });
  }
});

// Background sync for keeping playback alive
self.addEventListener('sync', event => {
  if (event.tag === 'keep-alive-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_KEEP_ALIVE' });
        });
      })
    );
  }
});

// Handle push notifications for playback control
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'चौपाल रेडियो',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'play',
        title: '▶ चलाएँ',
        icon: '/icon-192.png'
      },
      {
        action: 'pause',
        title: '॥ रोकें',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('चौपाल रेडियो', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'play' || event.action === 'pause') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        if (clients.length > 0) {
          clients[0].focus();
          clients[0].postMessage({ type: 'TOGGLE_PLAYBACK' });
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  } else {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});
