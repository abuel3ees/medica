#!/bin/bash
# Medica Deployment Script
# Run this on the server after pulling new code

set -e

echo "🚀 Deploying Medica..."

# Install/update dependencies
composer install --no-dev --optimize-autoloader

# Clear ALL caches (critical for Inertia + Spatie)
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan event:clear

# Run migrations
php artisan migrate --force

# NOTE: Do NOT run route:cache or config:cache
# It breaks Inertia's route macros on some platforms

echo "✅ Deployment complete!"
