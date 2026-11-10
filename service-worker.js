'use strict';

const CACHE_NAME = 'ch54b-load-calculator-v124';
const PRECACHE = [
  './',
  './index.html',
  './aircraft-checklists.js',
  './aircraft-checklists.css',
  './Checklist/embedded.js',
  './weight-and-balance.html',
  './fireline-planner.html',
  './cmrb-max-allowable.js',
  './cmrb-ige.js',
  './cmrb-oge.js',
  './ch54a-max-allowable.js',
  './ch54a-ige.js',
  './ch54a-oge.js',
  './ch54a-torque.js',
  './ch54a-epr.js',
  './ch54a-cmrb-max-allowable.js',
  './ch54a-cmrb-ige.js',
  './ch54a-cmrb-oge.js',
  './ch54b-oge.js',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './company-logo.png',
  './Checklist/index.html',
  './Checklist/ch54a.html',
  './Checklist/checklist.js',
  './Checklist/normal.html',
  './Checklist/normal-data.js',
  './Checklist/normal.js',
  './Checklist/list-runner.js',
  './Checklist/list-runner.css',
  './Checklist/emergency.html',
  './Checklist/emergency-data.js',
  './Checklist/emergency-a.html',
  './Checklist/emergency-a-data.js',
  './Checklist/emergency.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => (key.startsWith('ch54b-load-calculator-') || key.startsWith('ch54-checklist-preview-')) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request, {ignoreSearch: url.searchParams.get('embedded') === '1'})) || (await caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
