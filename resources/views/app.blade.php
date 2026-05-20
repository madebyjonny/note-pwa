<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#191919" media="(prefers-color-scheme: dark)">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Notes') }}">

        <title inertia>{{ config('app.name', 'Notes') }}</title>

        <!-- PWA -->
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600&display=swap" rel="stylesheet" />

        <!-- Dark mode: apply before render to avoid flash -->
        <script>
            (function () {
                var stored = localStorage.getItem('theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        <!-- Reverb runtime config (injected server-side so build-time VITE_ vars are not needed) -->
        <script>
            window.__reverb = {
                key: @json(config('reverb.apps.apps.0.key', '')),
                host: @json(config('reverb.apps.apps.0.options.host', '127.0.0.1')),
                port: @json((int) config('reverb.apps.apps.0.options.port', 8080)),
                scheme: @json(config('reverb.apps.apps.0.options.scheme', 'http')),
            };
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- PWA Service Worker -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js');
                });
            }
        </script>
    </body>
</html>
