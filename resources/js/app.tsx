import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import Echo from "laravel-echo";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import Pusher from "pusher-js";
import { createRoot, hydrateRoot } from "react-dom/client";

const appName = import.meta.env.VITE_APP_NAME || "Notes";

// Set up Laravel Echo with Reverb
// Config is injected at runtime via window.__reverb (see app.blade.php)
// to avoid Railway's lack of ${VAR} interpolation baking a literal string into the bundle.
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rv = (window as any).__reverb ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: "reverb",
        key: rv.key ?? import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: rv.host ?? import.meta.env.VITE_REVERB_HOST,
        wsPort: rv.port ?? import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: rv.port ?? import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS:
            (rv.scheme ?? import.meta.env.VITE_REVERB_SCHEME ?? "https") ===
            "https",
        enabledTransports: ["ws", "wss"],
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: "#8b8b8b",
    },
});
