// 인터넷 없이도 앱이 열리도록 파일을 휴대폰에 저장해 두는 일꾼(서비스 워커)
// 앱 파일을 고치면 VERSION 숫자를 올려 주세요. 그래야 새 파일로 바뀌어요.
const VERSION = "v4";
const CACHE = "doll-numbers-" + VERSION;

const sounds = [];
for (let n = 0; n <= 100; n++) sounds.push(`sounds/n${n}.mp3`);
for (let n = 1; n <= 20; n++) sounds.push(`sounds/c${n}.mp3`, `sounds/m${n}.mp3`);
for (let n = 1; n <= 10; n++) sounds.push(`sounds/g${n}.mp3`, `sounds/f${n}.mp3`);
["hello", "sub1", "sub2", "q1", "fless", "fmore", "more", "less", "trace", "tracemore", "balloon", "train",
 "q2", "q3", "row", "q4", "hint", "together", "locked", "clear", "sticker", "opened", "sleepy",
 "praise0", "praise1", "praise2", "cheer0", "cheer1", "cheer2",
 "btn_feed", "btn_trace", "btn_erase", "btn_clear", "btn_home", "btn_speaker"].forEach(k => sounds.push(`sounds/${k}.mp3`));

const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", ...sounds];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // 앱 화면(index.html)은 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장된 것 쓰기
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./", copy));
        return res;
      }).catch(() => caches.match("./"))
    );
    return;
  }

  // 나머지(소리, 아이콘, 글꼴)는 저장된 것이 있으면 그걸 쓰고, 없으면 받아서 저장
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
