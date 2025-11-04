#!/usr/bin/env bash

set -o errexit

# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate app key if not exists
php artisan key:generate --force --no-interaction

# Run migrations
php artisan migrate --force --no-interaction

# Seed database (first time only)
php artisan db:seed --force --no-interaction || true

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link || true

echo "Build completed successfully!"
