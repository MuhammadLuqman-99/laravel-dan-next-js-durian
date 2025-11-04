# 🚀 QUICK SETUP: Deploy Backend ke Render

## ⚡ Fast Track (5 minit)

### Step 1: Create Web Service
1. Go to: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `laravel-dan-next-js-durian`
4. **PENTING**:
   - **Root Directory**: Leave EMPTY (guna root)
   - **Name**: `durian-backend`
   - **Region**: Singapore
   - **Branch**: main
   - **Environment**: Docker (auto-detect)
   - **Plan**: Free

5. **JANGAN DEPLOY LAGI!** Click "Create Web Service" tapi **untick "Auto-Deploy"**

---

### Step 2: Add Environment Variables

Go to **Environment** tab, add SEMUA ini:

#### 🔴 WAJIB (Must Have):

```
APP_KEY = base64:[YOUR_APP_KEY]
APP_ENV = production
APP_DEBUG = false

DB_CONNECTION = pgsql
DB_HOST = your-database-host.render.com
DB_PORT = 5432
DB_DATABASE = durian_farm
DB_USERNAME = your-database-user
DB_PASSWORD = [YOUR_DB_PASSWORD]
```

#### 🟡 Recommended:

```
APP_NAME = Durian Farm System
APP_URL = https://durian-backend.onrender.com

LOG_CHANNEL = stderr
LOG_LEVEL = info

SESSION_DRIVER = database
SESSION_LIFETIME = 120
SESSION_DOMAIN = .onrender.com

CACHE_STORE = database
QUEUE_CONNECTION = database

MAIL_MAILER = log
```

**Copy dari file**: `RENDER_ENV_COPY_PASTE.txt` untuk full list

---

### Step 3: Deploy!

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 10-15 minit
3. Check **Logs** tab untuk progress

---

### Step 4: Verify

Test URL bila deploy success:
```
https://your-app-name.onrender.com/api/zones
```

Should return JSON response (might be empty array first time)

---

### Step 5: Create Admin User

1. Go to **Shell** tab
2. Run:
```bash
php artisan tinker
```

3. Paste:
```php
$user = new \App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@durianfarm.com';
$user->password = bcrypt('admin123');
$user->role = 'admin';
$user->save();
exit
```

4. Test login di Postman/frontend:
```
POST https://your-app.onrender.com/api/login
{
  "email": "admin@durianfarm.com",
  "password": "admin123"
}
```

---

### Step 6: Seed Busut Data (Optional)

Di Shell tab:
```bash
php artisan db:seed --class=BusutSeeder --force
```

Ini akan create 229 busut (179 Area Atas + 50 Area Bawah)

---

## ❌ Troubleshooting

### Error: "No APP_KEY"
**Fix**: Add `APP_KEY` environment variable (from Step 2)

### Error: "Connection refused"
**Fix**:
1. Check DB_HOST guna **Internal URL** (dpg-xxx-**a**)
2. NOT External URL (dpg-xxx without -a)

### Error: "502 Bad Gateway"
**Fix**:
1. Check Logs tab
2. Likely PHP or Nginx error
3. Verify all environment variables added

### Build takes too long
**Normal**: First build = 10-15 minit
Next builds = 5-7 minit (cached)

### Service sleeping
**Free Tier**: Service sleep after 15 min inactivity
First request after sleep = slow (30-60 sec)

---

## 📋 Checklist

- [ ] Web Service created
- [ ] Environment variables added (minimum: APP_KEY, DB_*)
- [ ] Manual deploy triggered
- [ ] Build successful (check Logs)
- [ ] API endpoints working
- [ ] Admin user created
- [ ] Frontend can connect

---

## 🎯 Next Steps

1. **Get Service URL**: Copy from Render dashboard
2. **Update Frontend**: Add `VITE_API_URL` environment variable
3. **Deploy Frontend**: Follow frontend deployment guide
4. **Connect**: Test full stack integration

---

## 📞 Need Help?

Check files:
- **Full Guide**: `RENDER_DEPLOYMENT_STEPS.md`
- **Environment Variables**: `RENDER_ENV_COPY_PASTE.txt`
- **Troubleshooting**: `RENDER_TROUBLESHOOTING.md`

**Service URL Format**: `https://durian-backend-XXXX.onrender.com`

---

**Done! Backend is live! 🎉**
========================================
RENDER ENVIRONMENT VARIABLES
Copy Paste Format - Satu persatu
========================================

Pergi ke: Render Dashboard > Your Web Service > Environment > Add Environment Variable

Copy paste key dan value untuk setiap baris:

-------------------
Key: APP_NAME
Value: Durian Farm System
-------------------

-------------------
Key: APP_ENV
Value: production
-------------------

-------------------
Key: APP_KEY
Value: base64:[YOUR_APP_KEY]
-------------------

-------------------
Key: APP_DEBUG
Value: false
-------------------

-------------------
Key: APP_URL
Value: https://your-app-name.onrender.com
-------------------

-------------------
Key: LOG_CHANNEL
Value: stderr
-------------------

-------------------
Key: LOG_LEVEL
Value: info
-------------------

-------------------
Key: DB_CONNECTION
Value: pgsql
-------------------

-------------------
Key: DB_HOST
Value: your-database-host.render.com
-------------------

-------------------
Key: DB_PORT
Value: 5432
-------------------

-------------------
Key: DB_DATABASE
Value: durian_farm
-------------------

-------------------
Key: DB_USERNAME
Value: your-database-user
-------------------

-------------------
Key: DB_PASSWORD
Value: [YOUR_DB_PASSWORD]
-------------------

-------------------
Key: SESSION_DRIVER
Value: database
-------------------

-------------------
Key: SESSION_LIFETIME
Value: 120
-------------------

-------------------
Key: SESSION_ENCRYPT
Value: false
-------------------

-------------------
Key: SESSION_PATH
Value: /
-------------------

-------------------
Key: SESSION_DOMAIN
Value: .onrender.com
-------------------

-------------------
Key: CACHE_STORE
Value: database
-------------------

-------------------
Key: QUEUE_CONNECTION
Value: database
-------------------

-------------------
Key: BROADCAST_CONNECTION
Value: log
-------------------

-------------------
Key: FILESYSTEM_DISK
Value: local
-------------------

-------------------
Key: MAIL_MAILER
Value: log
-------------------

-------------------
Key: MAIL_FROM_ADDRESS
Value: noreply@durianfarm.com
-------------------

-------------------
Key: BCRYPT_ROUNDS
Value: 12
-------------------

========================================
OPTIONAL (Kalau nak frontend integration)
========================================

-------------------
Key: SANCTUM_STATEFUL_DOMAINS
Value: localhost,127.0.0.1,your-frontend.vercel.app
-------------------

-------------------
Key: CORS_ALLOWED_ORIGINS
Value: https://your-frontend.vercel.app,http://localhost:5173
-------------------

========================================
IMPORTANT NOTES:
========================================

1. GANTI "your-app-name.onrender.com" dengan nama service Render anda yang sebenar

2. GANTI "your-frontend.vercel.app" dengan URL frontend anda nanti

3. APP_KEY sudah generated: base64:[YOUR_APP_KEY]
   JANGAN ubah atau regenerate!

4. Database credentials dah betul untuk PostgreSQL yang anda create

5. Lepas add semua env variables, click "Save Changes" kat Render

========================================


---

# Troubleshooting


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
DB_HOST=your-database-host.render.com
DB_PORT=5432
DB_DATABASE=durian_farm
DB_USERNAME=your-database-user
DB_PASSWORD=[YOUR_DB_PASSWORD]
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
✅ DB_HOST=your-database-host.render.com
✅ DB_PORT=5432
✅ DB_DATABASE=durian_farm
✅ DB_USERNAME=your-database-user
✅ DB_PASSWORD=[YOUR_DB_PASSWORD]

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
