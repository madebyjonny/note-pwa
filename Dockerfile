FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
# pcntl is required by Laravel Reverb for signal handling (SIGINT, SIGTERM, etc.)
RUN docker-php-ext-install \
    pcntl \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    zip \
    mbstring \
    xml \
    bcmath

# Install the Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Run composer scripts now that the full app is present
RUN composer run-script post-autoload-dump || true

# Build frontend assets
RUN npm run build

# Ensure storage and cache directories are writable
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint script selects the start command based on the SERVICE env var:
#   SERVICE=reverb  → php artisan reverb:start (sunny-joy)
#   SERVICE=web     → php artisan migrate + serve  (note-pwa)
# The Railway service's Variables tab should set SERVICE accordingly.
CMD ["/bin/sh", "-c", "if [ \"$SERVICE\" = \"reverb\" ]; then php artisan reverb:start --host=0.0.0.0 --port=8080; else php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=8000; fi"]
