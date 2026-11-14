// Service worker ของแอป Hoxin WMS-Docs: เก็บหน้าแอปและไอคอนไว้ในเครื่อง ให้เปิดแอปได้เร็ว
// ตัวระบบ (Google Apps Script) โหลดจากอินเทอร์เน็ตทุกครั้ง ไม่ถูกเก็บไว้ในเครื่อง
const CACHE = 'hoxin-wh-esign-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'logo.jpg', 'icon-192.png', 'icon-512.png',
               'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-64.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// เฉพาะไฟล์ของแอปเอง: ดึงจากเน็ตก่อน (ได้เวอร์ชันล่าสุด) ถ้าไม่มีเน็ตค่อยใช้ที่เก็บไว้
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
