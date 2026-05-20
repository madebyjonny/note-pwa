#!/usr/bin/env bash
set -e

php artisan optimize
php artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
