const CACHE_NAME = "notes-pwa-v1";
const STATIC_ASSETS = [
    "/",
    "/manifest.json",
    "/icons/icon.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and cross-origin requests
    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    // Skip Vite HMR and WebSocket requests
    if (
        url.pathname.startsWith("/@") ||
        url.protocol === "ws:" ||
        url.protocol === "wss:"
    ) {
        return;
    }

    // Network-first for HTML navigation
    if (
        request.mode === "navigate" ||
        request.headers.get("accept")?.includes("text/html")
    ) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() =>
                    caches
                        .match(request)
                        .then((cached) => cached || caches.match("/")),
                ),
        );
        return;
    }

    // Cache-first for static assets (JS, CSS, images, fonts)
    if (
        url.pathname.match(
            /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|ico)$/,
        ) ||
        url.pathname.startsWith("/build/")
    ) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        const clone = response.clone();
                        caches
                            .open(CACHE_NAME)
                            .then((cache) => cache.put(request, clone));
                        return response;
                    }),
            ),
        );
        return;
    }
});
