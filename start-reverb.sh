#!/usr/bin/env bash
set -e

# pcntl is required by Reverb for Unix signal handling (SIGINT/SIGTERM).
# PHP's extension_dir only knows about extensions baked into its own nix derivation.
# The php84Extensions.pcntl package puts pcntl.so in a *different* nix store path,
# so we locate it by filename and pass the absolute path to -d extension=.
if ! php -r "pcntl_fork();" >/dev/null 2>&1; then
    PCNTL_SO=$(find /nix/store -name "pcntl.so" 2>/dev/null | head -1)
    if [ -n "$PCNTL_SO" ]; then
        exec php -d "extension=$PCNTL_SO" artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
    fi
    echo "Error: pcntl extension is required but could not be found in /nix/store." >&2
    exit 1
fi

exec php artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
