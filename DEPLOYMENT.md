# Deploying to Railway

This app deploys as two Railway services — a web app and a Reverb WebSocket server. No Redis or queue worker needed.

---

## 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **PostgreSQL** (or MySQL) plugin

## 2. Connect your repo

- Click **New Service → GitHub Repo**
- Select this repository

## 3. Environment variables

In Railway's **Variables** tab for the `web` service:

```env
APP_NAME=Notes
APP_ENV=production
APP_KEY=base64:<generated>          # php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://your-app.railway.app

# Database (Railway plugin references)
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# No Redis needed
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

# Points to the Reverb service domain (set after deploying Reverb service)
VITE_APP_NAME="${APP_NAME}"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST=your-reverb-service.railway.app
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

## 4. PHP version

Railway defaults to PHP 8.3. This project requires PHP 8.4 (Symfony 8 / Laravel 13). The `nixpacks.toml` in the repo root pins it automatically — no manual config needed.

If Railway still picks the wrong version, add this environment variable in the service's **Variables** tab:

```
NIXPACKS_PHP_VERSION=8.4
```

## 5. Build command

```bash
composer install --no-dev --optimize-autoloader && npm ci --legacy-peer-deps && npm run build && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

## 6. Start command

```bash
php artisan migrate --force && php -S 0.0.0.0:$PORT -t public
```

**Recommended** — use Laravel Octane with FrankenPHP for better performance:

```bash
composer require laravel/octane
php artisan octane:install --server=frankenphp
```

Then set start command to:

```bash
php artisan migrate --force && php artisan octane:start --host=0.0.0.0 --port=$PORT
```

## 7. Reverb service

Add a second Railway service from the same repo.

**Start command:**

```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

Once deployed, copy the service's Railway domain into `VITE_REVERB_HOST` on the `web` service.

## 8. CORS for Reverb

In `config/reverb.php`:

```php
'allowed_origins' => [env('APP_URL')],
```

---

## Service summary

| Service  | Purpose          | Start command                                                                         |
| -------- | ---------------- | ------------------------------------------------------------------------------------- |
| `web`    | Main app (HTTP)  | `php artisan migrate --force && php artisan octane:start --host=0.0.0.0 --port=$PORT` |
| `reverb` | WebSocket server | `php artisan reverb:start --host=0.0.0.0 --port=8080`                                 |

## First run

On first visit the app redirects to `/setup` where you create your account. This page is permanently disabled once a user exists.

---

## Troubleshooting

**`composer install` fails: lock file not compatible, requires PHP >=8.4`**
Railway picked PHP 8.3. Add `NIXPACKS_PHP_VERSION=8.4` to the service's environment variables and redeploy.

**`npm ci` fails: package-lock.json out of sync**
Run `npm install --legacy-peer-deps` locally, commit the updated `package-lock.json`, and push.
