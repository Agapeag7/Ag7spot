self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  const payload = event.data && event.data.json ? event.data.json() : null;
  const title = payload && payload.title ? payload.title : 'Ag7Spot';
  const body = payload && payload.body ? payload.body : 'Tu as une nouvelle notification.';
  const data = payload && payload.data ? payload.data : {};
  const notificationOptions = {
    body,
    icon: payload && payload.icon ? payload.icon : '/ico/spot.png',
    badge: payload && payload.badge ? payload.badge : '/ico/spot.png',
    data: Object.assign({ url: payload && payload.url ? payload.url : '/index.php' }, data),
    vibrate: [100, 50, 100]
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData = event.notification && event.notification.data ? event.notification.data : {};
  const targetUrl = new URL(notificationData.url || '/index.php', self.location.origin);

  if (notificationData.type) {
    const encoded = encodeURIComponent(JSON.stringify({
      type: notificationData.type,
      title: event.notification.title || '',
      body: event.notification.body || '',
      data: notificationData
    }));
    targetUrl.searchParams.set('notification', encoded);
  }

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true, cache: 'no-cache' });
    const hasClient = clientList.some(windowClient => windowClient.url.startsWith(self.location.origin));
    if (hasClient) {
      const focused = clientList.find(client => client.focused) || clientList[0];
      if (focused) {
        return focused.navigate(targetUrl.toString()).then(client => client && client.focus());
      }
    }
    return clients.openWindow(targetUrl.toString());
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
