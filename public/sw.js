const CACHE_NAME = 'chatbot-v1';
const API_CACHE = 'chat-api-v1';

const urlsToCache = ['/', '/index.html', '/manifest.json', '/logo192.png', '/logo512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  const isChatApi = request.method === 'POST' &&
    url.origin ===  process.env.REACT_APP_LOCAL_API_URL &&
    url.pathname === process.env.REACT_APP_CHAT_API_URL;

  if (isChatApi) {
    event.respondWith(
      fetch(request, { mode: 'cors' })
        .then(async response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            const fakeGetKey = new Request(url.origin + url.pathname + '?last-response', { method: 'GET' });
            caches.open(API_CACHE).then(cache => cache.put(fakeGetKey, clone));
          }
          return response;
        })
        .catch(async () => {
          const fakeGetKey = new Request(url.origin + url.pathname + '?last-response', { method: 'GET' });
          const cached = await caches.match(fakeGetKey);
          if (cached) return cached;

          return new Response(
            JSON.stringify({ reply: "You're offline. Your message is saved and will send automatically when you're back!" }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          );
        })
    );
    return;
  }

  event.respondWith(caches.match(request).then(r => r || fetch(request)));
});