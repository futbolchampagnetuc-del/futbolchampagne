// FutbolChampagne — Service Worker
const CACHE_NAME = "futbol-champagne-v1";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

// Instalación: cachear assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: estrategia híbrida
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Assets estáticos: cache first
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Datos de API: network first con fallback a cache
  if (url.pathname.startsWith("/api/") || url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Otros: network only
  event.respondWith(fetch(request).catch(() => offlinePage()));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return offlinePage();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlinePage();
  }
}

function offlinePage() {
  return new Response(
    JSON.stringify({
      error: "Sin conexión",
      message: "Los datos se actualizarán cuando tengas conexión",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
