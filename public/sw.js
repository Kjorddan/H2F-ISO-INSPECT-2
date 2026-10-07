const CACHE_NAME='h2f-iso-app-shell-v25'; const APP_SHELL=['/','/index.html','/manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.headers.has('authorization')||r.headers.has('cookie'))return;const u=new URL(r.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(resp=>{if(resp.ok&&['document','script','style','image','font'].includes(r.destination)){const cp=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(r,cp));}return resp;})));});
