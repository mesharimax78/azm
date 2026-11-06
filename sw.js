/* Azm service worker: app shell offline, videos cached on first play, range requests served from cache (iOS video). */
const V='azm-20261107003424', VIDS='azm-videos';
const SHELL=['./','./index.html','./manifest.webmanifest','./img/base_front.webp','./img/base_back.webp','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==VIDS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

async function rangeFrom(res,range){
  const buf=await res.arrayBuffer(),len=buf.byteLength,m=/bytes=(\d*)-(\d*)/.exec(range||'');
  let a=m&&m[1]!==''?+m[1]:0,b=m&&m[2]!==''?+m[2]:len-1;
  if(m&&m[1]===''&&m[2]!==''){a=Math.max(0,len-+m[2]);b=len-1}
  b=Math.min(b,len-1);
  if(a>b||a>=len)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${len}`}});
  return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':`bytes ${a}-${b}/${len}`,'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}});
}

async function video(req){
  const url=new URL(req.url);url.search='';const key=url.href;
  const c=await caches.open(VIDS);let hit=await c.match(key);
  if(!hit){
    try{const full=await fetch(key);if(full.ok&&full.status===200){await c.put(key,full.clone());hit=full}else return fetch(req)}
    catch(e){return fetch(req)}
  }
  const range=req.headers.get('range');
  return range?rangeFrom(hit,range):hit;
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(url.pathname.includes('/videos/')){e.respondWith(video(req));return}
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put('./index.html',cp))}return r}).catch(()=>caches.match('./index.html')));return;
  }
  e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(req,cp))}return r})));
});
