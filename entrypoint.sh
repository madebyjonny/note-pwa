#!/bin/sh

if [ "$SERVICE" = "reverb" ]; then
    php artisan reverb:start --host=0.0.0.0 --port=8080
else
    php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=8000
fi
