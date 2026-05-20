#!/usr/bin/env bash
set -e

# pcntl is required by Reverb for Unix signal handling (SIGINT/SIGTERM).
# Load it explicitly at runtime in case nixpacks didn't wire it into php.ini.
exec php -d extension=pcntl artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
