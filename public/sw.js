const CACHE_NAME = 'tinder-work-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Add other static assets you want to cache
];

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        }).filter(cacheName => cacheName !== null)
      );
    })
  );
  // Enable navigation preload if supported
  if ('navigationPreload' in self.registration) {
    event.waitUntil(
      self.registration.navigationPreload.enable()
    );
  }
  self.clients.claim();
});

// Fetch event for serving cached assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Vite dev server requests
  if (event.request.url.includes('__vite_ping')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // For navigation requests, return the offline page if offline
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL)
            .then((offlineResponse) => {
              return offlineResponse || fetch(event.request)
                .catch(() => caches.match(OFFLINE_URL));
            });
        }

        // For other requests, try the network first, then cache
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache large responses
                if (responseToCache.body && responseToCache.body.used) {
                  return;
                }
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both network and cache fail, return the offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Offline',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    console.log('Background sync for messages');
    // Add your background sync logic here
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        const existingWindow = windowClients.find(
          (client) => client.url === urlToOpen && 'focus' in client
        );

        if (existingWindow) {
          // Focus the existing window/tab
          return existingWindow.focus();
        } else if (clients.openWindow) {
          // Open a new window/tab
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
