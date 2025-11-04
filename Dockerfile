# Use official PHP-FPM image for better performance
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nginx \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first for dependency caching
COPY durian-backend/composer.json durian-backend/composer.lock ./

# Install PHP dependencies (without scripts first for caching)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy rest of application
COPY durian-backend/ .

# Run composer scripts (post-install, etc.)
RUN composer dump-autoload --optimize

# Create storage directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy nginx config
RUN echo 'events { worker_connections 1024; } \n\
http { \n\
    include mime.types; \n\
    default_type application/octet-stream; \n\
    server { \n\
        listen 8080; \n\
        root /app/public; \n\
        index index.php; \n\
        location / { \n\
            try_files $uri $uri/ /index.php?$query_string; \n\
        } \n\
        location ~ \.php$ { \n\
            fastcgi_pass 127.0.0.1:9000; \n\
            fastcgi_index index.php; \n\
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \n\
            include fastcgi_params; \n\
        } \n\
    } \n\
}' > /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start script
RUN echo '#!/bin/bash \n\
set -e \n\
\n\
echo "Starting Laravel application..." \n\
\n\
# Run migrations first (creates tables including cache) \n\
echo "Running migrations..." \n\
php artisan migrate --force || echo "Migration failed, continuing..." \n\
\n\
# Seed database (creates admin user and sample data) \n\
echo "Seeding database..." \n\
php artisan db:seed --force || echo "Seeding failed or already seeded, continuing..." \n\
\n\
# Clear old caches \n\
echo "Clearing caches..." \n\
php artisan config:clear || true \n\
php artisan cache:clear || true \n\
php artisan route:clear || true \n\
php artisan view:clear || true \n\
\n\
# Rebuild caches \n\
echo "Building caches..." \n\
php artisan config:cache \n\
php artisan route:cache \n\
php artisan view:cache \n\
\n\
# Start PHP-FPM \n\
echo "Starting PHP-FPM..." \n\
php-fpm -D \n\
\n\
# Start Nginx \n\
echo "Starting Nginx..." \n\
nginx -g "daemon off;"' > /start.sh \
    && chmod +x /start.sh

CMD ["/start.sh"]
