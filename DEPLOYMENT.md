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
composer install --no-dev --optimize-autoloader && npm install --legacy-peer-deps && npm run build
```

> Do **not** run `artisan config:cache` / `route:cache` / `view:cache` here — they run without real env vars at build time and will cache broken values.
> `npm install` is used instead of `npm ci` to avoid an EBUSY error when Railway's cached `node_modules/.cache` directory is locked.

## 6. Start command

```bash
php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=$PORT
```

`php artisan optimize` runs config, route, view, and event caching in one step — with the real env vars available at start time.

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

| Service  | Purpose          | Start command                                                                                                            |
| -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `web`    | Main app (HTTP)  | `php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=$PORT` |
| `reverb` | WebSocket server | `php artisan reverb:start --host=0.0.0.0 --port=8080`                                                                    |

## First run

On first visit the app redirects to `/setup` where you create your account. This page is permanently disabled once a user exists.

---

## Troubleshooting

**Reverb service crashes: `Undefined constant "...SIGINT"`**
The `pcntl` PHP extension is missing. `nixpacks.toml` enables it automatically. If you still see this error, add the following to the **Reverb** service's Variables tab and redeploy:

```
NIXPACKS_PHP_EXTENSIONS=pcntl,pdo_pgsql,mbstring,xml,curl,zip,bcmath,intl
```

**`composer install` fails: lock file not compatible, requires PHP >=8.4`**
Railway picked PHP 8.3. Add `NIXPACKS_PHP_VERSION=8.4` to the service's environment variables and redeploy.

**`npm ci` fails: package-lock.json out of sync**
Run `npm install --legacy-peer-deps` locally, commit the updated `package-lock.json`, and push.

**"Application failed to respond"**
This means the app process started but never bound to `$PORT`. Most common causes:

- Artisan cache commands ran at **build time** without env vars, caching null/broken config. Move them to the start command (see above).
- `php artisan migrate --force` failed because the database wasn't ready. Check the Railway deploy logs — look for a migration or DB connection error before the server line.
- `APP_KEY` is missing or blank. Verify it is set in the service's Variables tab (`php artisan key:generate --show` locally to get the value).
