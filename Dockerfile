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

# Copy backend application files from durian-backend folder
COPY durian-backend/ .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

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
# Clear caches \n\
php artisan config:clear \n\
php artisan cache:clear \n\
php artisan route:clear \n\
\n\
# Run migrations \n\
php artisan migrate --force \n\
\n\
# Cache configs \n\
php artisan config:cache \n\
php artisan route:cache \n\
php artisan view:cache \n\
\n\
# Start PHP-FPM \n\
php-fpm -D \n\
\n\
# Start Nginx \n\
nginx -g "daemon off;"' > /start.sh \
    && chmod +x /start.sh

CMD ["/start.sh"]
