/* PLAN:0 offline service worker. Keep this dependency-free so it can start during a network outage. */
const VERSION = "plan0-offline-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-household`;
const SNAPSHOT_PATH = "__plan0-household-snapshot";
const NETWORK_TIMEOUT_MS = 1500;

const APP_SHELL_URLS = [
  "/",
  "/crisis",
  "/emergency",
  "/family",
  "/family/medical",
  "/plan",
  "/plan/details",
  "/supplies",
  "/settings",
  "/app-icon-180.png",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/brand/logo-color.svg",
  "/manifest.webmanifest",
];

function snapshotRequest() {
  return new Request(new URL(SNAPSHOT_PATH, self.registration.scope).href);
}

async function cacheResponse(cache, request, response) {
  if (response && response.ok) await cache.put(request, response.clone());
  return response;
}

async function cacheUrl(cache, url) {
  try {
    const response = await fetch(url, { cache: "reload" });
    await cacheResponse(cache, url, response);
  } catch {
    // A route can be cached the first time a household successfully visits it.
  }
}

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetchWithTimeout(request);
    return cacheResponse(cache, request, response);
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return (await cache.match("/")) || new Response("PLAN:0 is unavailable offline until it has been opened once while connected.", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        status: 503,
      });
    }
    return Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(cache, request, await fetch(request));
  } catch {
    return Response.error();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(APP_SHELL_URLS.map((url) => cacheUrl(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith("plan0-offline-") && name !== SHELL_CACHE && name !== DATA_CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message.type !== "string") return;

  if (message.type === "CACHE_URLS" && Array.isArray(message.urls)) {
    event.waitUntil((async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(message.urls
        .filter((value) => typeof value === "string")
        .filter((value) => new URL(value, self.location.origin).origin === self.location.origin)
        .map((url) => cacheUrl(cache, url)));
    })());
  }

  if (message.type === "CACHE_HOUSEHOLD_SNAPSHOT") {
    event.waitUntil((async () => {
      const cache = await caches.open(DATA_CACHE);
      const response = new Response(JSON.stringify({
        data: message.data,
        savedAt: message.savedAt,
      }), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      await cache.put(snapshotRequest(), response);
    })());
  }

  if (message.type === "DELETE_HOUSEHOLD_SNAPSHOT") {
    event.waitUntil(caches.open(DATA_CACHE)
      .then((cache) => cache.delete(snapshotRequest()))
      .finally(() => event.ports[0]?.postMessage({ type: "HOUSEHOLD_SNAPSHOT_DELETED" })));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.endsWith(SNAPSHOT_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || request.destination === "style" || request.destination === "script" || request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
