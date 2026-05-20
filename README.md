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

The app will be at `http://localhost:8000`. On first visit you'll be prompted to create your account.

`composer run dev` starts Laravel, Vite HMR, Reverb WebSocket server, queue listener, and Pail log viewer concurrently.

## Single-user

There is no public registration. On first run (no users in the database) the app redirects to `/setup` where you create the one account. That page is permanently disabled once a user exists.

## PWA Icons

Icons live in `public/icons/`. To regenerate from the SVG source:

```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/icons/icon.svg');
[16, 32, 192, 512].forEach(s =>
  sharp(svg).resize(s, s).png().toFile('public/icons/icon-' + s + '.png')
    .then(() => console.log('Generated', s + 'px'))
);
"
```

## Dark Mode

Applied automatically from OS preference on first visit. Toggle in the sidebar. Stored in `localStorage`.

## Tailwind note

Uses Tailwind v4 — `tailwind.config.js` is inert. All theme config lives in `resources/css/app.css` inside `@theme {}` blocks.

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway setup.

## License

MIT

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **MySQL** or **PostgreSQL** plugin (Railway provides both)

No Redis or queue worker needed — this app uses a sync queue driver and database-backed sessions/cache, keeping the deployment to just two services.

### 2. Connect your repo

Push this repo to GitHub, then in Railway:

- Click **New Service → GitHub Repo**
- Select this repository

### 3. Configure environment variables

In Railway's **Variables** tab, add the following:

```env
APP_NAME=Notes
APP_ENV=production
APP_KEY=base64:<generated>          # run: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://your-app.railway.app

# Database — Railway provides these automatically for plugins
# If using PostgreSQL:
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# No Redis needed — sync queue, database session/cache
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
CACHE_STORE=database
BROADCAST_CONNECTION=reverb

# Reverb
REVERB_APP_ID=<your-reverb-app-id>
REVERB_APP_KEY=<your-reverb-app-key>
REVERB_APP_SECRET=<your-reverb-app-secret>
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https

# Frontend Reverb connection (point to the Reverb service domain)
VITE_APP_NAME="${APP_NAME}"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST=your-reverb-service.railway.app
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

> **Generate APP_KEY**: Run `php artisan key:generate --show` locally and paste the output.

### 4. Set up the build command

In Railway's **Settings → Build**, set:

```bash
composer install --no-dev --optimize-autoloader && npm ci --legacy-peer-deps && npm run build && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

### 5. Set up the start command

```bash
php artisan migrate --force && php artisan octane:start --host=0.0.0.0 --port=$PORT
```

**Or**, using PHP's built-in server (simpler, less performant):

```bash
php artisan migrate --force && php -S 0.0.0.0:$PORT -t public
```

> **Recommended**: Install Laravel Octane with FrankenPHP for best Railway performance:
>
> ```bash
> composer require laravel/octane
> php artisan octane:install --server=frankenphp
> ```

### 6. Deploy Reverb as a separate service

Laravel Reverb is a long-running WebSocket server and must run as its own Railway service.

Add another service from the same repo with:

```bash
# Start command for Reverb service
php artisan reverb:start --host=0.0.0.0 --port=8080
```

After deploying, set the Reverb service's Railway domain as `VITE_REVERB_HOST` in the main app service.

### 7. Configure CORS for Reverb

In `config/reverb.php`, set allowed origins to your Railway domain:

```php
'allowed_origins' => [env('APP_URL')],
```

---

## Railway Service Summary

| Service  | Purpose          | Start Command                                                                         |
| -------- | ---------------- | ------------------------------------------------------------------------------------- |
| `web`    | Main app (HTTP)  | `php artisan migrate --force && php artisan octane:start --host=0.0.0.0 --port=$PORT` |
| `reverb` | WebSocket server | `php artisan reverb:start --host=0.0.0.0 --port=8080`                                 |

---

## PWA Icons

Icons are pre-generated in `public/icons/`. To regenerate from the SVG:

```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/icons/icon.svg');
[16, 32, 192, 512].forEach(s =>
  sharp(svg).resize(s, s).png().toFile('public/icons/icon-' + s + '.png')
    .then(() => console.log('Generated', s + 'px'))
);
"
```

---

## Dark Mode

Applied automatically based on OS preference on first visit. Users can toggle via the sidebar. Preference is stored in `localStorage`.

---

## License

MIT
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>

</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
