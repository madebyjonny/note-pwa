<p align="center"><img src="public/icons/icon.svg" width="80" alt="Notes App Logo"></p>

# Notes PWA

A Notion-inspired notes app. Block-based rich text editing, real-time sync, dark/light mode, and installable as a PWA on desktop and mobile.

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Backend   | Laravel 13, PHP 8.4                              |
| Frontend  | React 18 + TypeScript, Inertia.js (SSR)          |
| Editor    | BlockNote                                        |
| Real-time | Laravel Reverb (WebSocket)                       |
| Styling   | Tailwind CSS v4, Framer Motion                   |
| Auth      | Laravel Breeze (single-user, setup-on-first-run) |
| PWA       | Web App Manifest + Service Worker                |
| Deploy    | Railway (Docker, two services)                   |

## Local Development

### Prerequisites

- PHP 8.2+, Composer
- Node.js 20+, npm

### Setup

```bash
composer install
npm install --legacy-peer-deps
cp .env.example .env
php artisan key:generate
php artisan migrate
composer run dev
```

App runs at `http://localhost:8000`. On first visit you'll be prompted to create your account.

`composer run dev` starts Laravel, Vite HMR, Reverb WebSocket server, and Pail log viewer concurrently.

## Single-user

No public registration. On first run the app redirects to `/setup` to create the one account. That route is permanently disabled once a user exists.

## License

MIT
