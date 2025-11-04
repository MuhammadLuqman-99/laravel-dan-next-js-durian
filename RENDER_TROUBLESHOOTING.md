# 🔧 Render Deployment Troubleshooting

## Common Render Errors & Solutions

### ❌ Error 1: "No APP_KEY Set"
**Symptoms**: Deploy fails with "RuntimeException: No application encryption key has been specified"

**Solution**:
1. Go to your Render dashboard
2. Click on your Web Service
3. Go to "Environment" tab
4. Add this variable:
   - Key: `APP_KEY`
   - Value: Generate dengan command `php artisan key:generate --show` kat local
   - Contoh: `base64:abcdefghijk1234567890...`

---

### ❌ Error 2: "Connection Refused (Database)"
**Symptoms**: `SQLSTATE[08006] [7] connection to server failed`

**Solution**: Check database credentials:
```
DB_CONNECTION=pgsql
DB_HOST=dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
DB_PORT=5432
DB_DATABASE=durian_farm
DB_USERNAME=durian_farm_user
DB_PASSWORD=F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr
```

**PENTING**: Guna **Internal Database URL** (yang dpg-xxx-a), BUKAN External URL!

---

### ❌ Error 3: "Build Failed - Composer Install"
**Symptoms**: Build logs show `composer install` error

**Possible causes**:
1. PHP version mismatch
2. Missing extensions
3. Memory limit

**Solution**: Use **Docker deployment** instead of Native PHP

---

### ❌ Error 4: "Migration Failed"
**Symptoms**: "Base table or view not found"

**Solution**: Run migrations manually:
1. Go to Shell tab di Render dashboard
2. Run: `php artisan migrate --force`
3. Run: `php artisan db:seed --class=BusutSeeder --force`

---

### ❌ Error 5: "Port Already In Use"
**Symptoms**: Application can't bind to port

**Solution**: Make sure startCommand uses `$PORT` environment variable:
```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

---

## 🎯 Recommended Render Setup

### Option A: Docker Deployment (RECOMMENDED)

**render.yaml:**
```yaml
services:
  - type: web
    name: durian-backend
    env: docker
    region: singapore
    plan: free
    dockerfilePath: ./Dockerfile
    autoDeploy: true
```

**Dockerfile:**
```dockerfile
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev \
    zip unzip libpq-dev nginx \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
```

**start.sh:**
```bash
#!/bin/bash

# Generate key if not exists
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM
php-fpm -D

# Start Nginx
nginx -g 'daemon off;'
```

**nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;

    server {
        listen 8080;
        root /app/public;
        index index.php;

        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location ~ \.php$ {
            fastcgi_pass 127.0.0.1:9000;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}
```

---

### Option B: Native PHP Environment

**render.yaml:**
```yaml
services:
  - type: web
    name: durian-backend
    env: php
    region: singapore
    plan: free
    buildCommand: |
      composer install --no-dev --optimize-autoloader
      php artisan config:cache
      php artisan route:cache
    startCommand: |
      php artisan migrate --force
      php artisan serve --host=0.0.0.0 --port=$PORT
```

---

## 📋 Complete Environment Variables Checklist

Go to Render Dashboard → Your Service → Environment, add these:

```
✅ APP_NAME=Durian Farm System
✅ APP_ENV=production
✅ APP_KEY=base64:YOUR_KEY_HERE
✅ APP_DEBUG=false
✅ APP_URL=https://your-app.onrender.com

✅ LOG_CHANNEL=stderr
✅ LOG_LEVEL=info

✅ DB_CONNECTION=pgsql
✅ DB_HOST=dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
✅ DB_PORT=5432
✅ DB_DATABASE=durian_farm
✅ DB_USERNAME=durian_farm_user
✅ DB_PASSWORD=F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr

✅ SESSION_DRIVER=database
✅ CACHE_STORE=database
✅ QUEUE_CONNECTION=database

✅ SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
✅ SESSION_DOMAIN=.onrender.com
```

---

## 🔍 How to Debug

### 1. Check Build Logs
- Go to Render Dashboard
- Click your service
- Click "Logs" tab
- Look for red error messages

### 2. Check Runtime Logs
- Same logs page
- Look for runtime errors after deploy

### 3. Use Shell Access
- Click "Shell" tab
- Run commands:
```bash
php artisan config:clear
php artisan cache:clear
php artisan migrate:status
php artisan route:list
```

### 4. Test Database Connection
```bash
php artisan tinker
DB::connection()->getPdo();
```

---

## 🚀 Step-by-Step Deployment (FRESH START)

### Step 1: Setup Database
1. Create PostgreSQL database on Render
2. Copy **Internal Database URL** (dpg-xxx-a)
3. Note down credentials

### Step 2: Prepare Laravel
```bash
cd durian-backend

# Generate APP_KEY
php artisan key:generate --show
# Copy output: base64:xxxxx

# Test local DB connection
php artisan migrate
php artisan db:seed --class=BusutSeeder
```

### Step 3: Create Web Service
1. Go to Render Dashboard
2. Click "New +"
3. Choose "Web Service"
4. Connect GitHub repo
5. Select `durian-backend` folder
6. Choose **Docker** or **Native Environment**

### Step 4: Configure Environment
Add ALL environment variables from checklist above

### Step 5: Deploy
- Click "Create Web Service"
- Wait for build (5-10 minutes)
- Check logs for errors

### Step 6: Run Migrations
Option A - Automatic (in startCommand):
```bash
php artisan migrate --force
```

Option B - Manual (via Shell):
1. Go to Shell tab
2. Run: `php artisan migrate --force`
3. Run: `php artisan db:seed --class=BusutSeeder --force`

---

## 💡 Pro Tips

1. **Use Docker**: More reliable than native PHP
2. **Check Logs First**: 90% of issues visible in logs
3. **Use Internal DB URL**: External URL untuk connection from outside
4. **Don't Cache in Build**: Cache in startCommand instead
5. **Set LOG_CHANNEL=stderr**: See logs in Render dashboard

---

## 📞 Quick Check Commands

Run these in Render Shell to verify setup:

```bash
# Check PHP version
php -v

# Check extensions
php -m | grep pdo

# Check env variables
php artisan env

# Check database connection
php artisan migrate:status

# Check routes
php artisan route:list

# Clear everything
php artisan optimize:clear
```

---

**Kalau masih error, screenshot error message dan send kat saya! 📸**
