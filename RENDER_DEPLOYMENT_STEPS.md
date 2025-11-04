# 🚀 Step-by-Step: Deploy Laravel ke Render

## ✅ Preparation Checklist

Dah siap:
- ✅ Dockerfile updated (PHP-FPM + Nginx)
- ✅ render.yaml configured
- ✅ Environment variables prepared
- ✅ PostgreSQL database created
- ✅ APP_KEY generated: `base64:eorA23r9mmfKGsqDN4xDCWJ7nywyrp/ExaGK+KBAnYE=`

---

## 📋 Step 1: Commit & Push ke GitHub

```bash
cd durian-backend

# Add files
git add Dockerfile render.yaml .env.render

# Commit
git commit -m "Update Render deployment configuration with Docker and env variables"

# Push
git push origin main
```

---

## 🌐 Step 2: Create Web Service di Render

1. **Login ke Render**: https://dashboard.render.com/

2. **Click "New +"** > **"Web Service"**

3. **Connect Repository**:
   - Click "Connect account" (GitHub)
   - Authorize Render
   - Select repository: `durian`
   - **PENTING**: Root Directory = `durian-backend`

4. **Configure Service**:
   - Name: `durian-backend` (atau nama lain)
   - Region: **Singapore**
   - Branch: `main`
   - Environment: **Docker** (auto-detect dari render.yaml)
   - Plan: **Free**

5. **Click "Create Web Service"** (jangan deploy lagi!)

---

## 🔧 Step 3: Add Environment Variables

Sekarang yang PALING PENTING! Kena add semua environment variables:

### Method 1: Manual (Recommended)

Pergi ke: **Environment** tab > **Add Environment Variable**

Copy paste dari file: `RENDER_ENV_COPY_PASTE.txt`

Atau guna list ini (kena add SATU persatu):

```
APP_NAME = Durian Farm System
APP_ENV = production
APP_KEY = base64:eorA23r9mmfKGsqDN4xDCWJ7nywyrp/ExaGK+KBAnYE=
APP_DEBUG = false
APP_URL = https://durian-backend.onrender.com (ganti dengan nama service anda)

LOG_CHANNEL = stderr
LOG_LEVEL = info

DB_CONNECTION = pgsql
DB_HOST = dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
DB_PORT = 5432
DB_DATABASE = durian_farm
DB_USERNAME = durian_farm_user
DB_PASSWORD = F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr

SESSION_DRIVER = database
SESSION_LIFETIME = 120
SESSION_ENCRYPT = false
SESSION_PATH = /
SESSION_DOMAIN = .onrender.com

CACHE_STORE = database
QUEUE_CONNECTION = database
BROADCAST_CONNECTION = log
FILESYSTEM_DISK = local

MAIL_MAILER = log
MAIL_FROM_ADDRESS = noreply@durianfarm.com

BCRYPT_ROUNDS = 12
```

### Method 2: Bulk Import

Pergi ke: **Environment** tab > **Add from .env**

Copy paste semua content dari file `.env.render`

---

## ⚙️ Step 4: Configure Advanced Settings (Optional)

1. **Auto-Deploy**: ON (supaya auto deploy bila push ke GitHub)
2. **Health Check Path**: `/` atau `/api/dashboard/statistics`

---

## 🚀 Step 5: Deploy!

1. Click **"Manual Deploy"** > **"Deploy latest commit"**

2. Wait for build (10-15 minit untuk first build)

3. Monitor logs:
   - Click **"Logs"** tab
   - Tengok ada error tak

---

## 📊 Step 6: Verify Deployment

### Check Build Logs

Pastikan ada message ni:
```
✓ Building Docker image...
✓ Installing dependencies...
✓ Running composer install...
✓ Starting nginx...
✓ Deploy successful!
```

### Test API Endpoints

Bila dah deploy, test endpoints ni:

1. **Health Check**:
   ```
   https://durian-backend.onrender.com/
   ```

2. **API Test**:
   ```
   https://durian-backend.onrender.com/api/zones
   ```

3. **Login Test**:
   ```
   POST https://durian-backend.onrender.com/api/login
   Body:
   {
     "email": "admin@example.com",
     "password": "password"
   }
   ```

---

## 🛠️ Step 7: Run Migrations

### Method 1: Automatic (Already in Dockerfile)
Migrations run automatically on startup! ✅

### Method 2: Manual (if needed)

1. Go to **Shell** tab
2. Run commands:
   ```bash
   # Check migration status
   php artisan migrate:status

   # Run migrations
   php artisan migrate --force

   # Seed busut data
   php artisan db:seed --class=BusutSeeder --force
   ```

---

## 🎉 Step 8: Create Admin User

Di **Shell** tab, run:

```bash
php artisan tinker
```

Then paste:

```php
$user = new \App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@durianfarm.com';
$user->password = bcrypt('admin123');
$user->role = 'admin';
$user->save();
exit
```

---

## 🔍 Troubleshooting

### Error: "No APP_KEY"
**Fix**: Add `APP_KEY` environment variable

### Error: "Connection refused"
**Fix**: Check DB credentials, pastikan guna **Internal URL** (dpg-xxx-**a**)

### Error: "Build failed"
**Fix**: Check Dockerfile syntax, pastikan semua dependencies installed

### Error: "502 Bad Gateway"
**Fix**: Check logs, biasanya PHP-FPM atau Nginx issue

### Application not responding
**Fix**:
1. Check logs untuk errors
2. Verify environment variables
3. Try manual deploy
4. Restart service

---

## 📱 Step 9: Connect Frontend

Update frontend API URL:

### Vercel Environment Variables:
```
VITE_API_URL = https://durian-backend.onrender.com/api
```

### Update CORS di Render:
Add environment variable:
```
CORS_ALLOWED_ORIGINS = https://your-frontend.vercel.app
```

---

## 🔄 Step 10: Update Domain di Environment Variables

**PENTING**: Lepas deploy, update ini:

1. Copy service URL: `https://durian-backend-xxxx.onrender.com`

2. Update environment variable:
   ```
   APP_URL = https://durian-backend-xxxx.onrender.com
   ```

3. Save changes

4. Redeploy (automatic atau manual)

---

## 💡 Pro Tips

1. **Free Tier Limitation**:
   - Service will sleep after 15 minutes of inactivity
   - First request after sleep = slow (30-60 seconds)
   - Consider upgrading untuk production

2. **Database Backups**:
   - Render auto-backup PostgreSQL
   - Download manual backup: Dashboard > Database > Backups

3. **Monitoring**:
   - Check logs regularly
   - Setup uptime monitoring (UptimeRobot, etc.)

4. **Environment Updates**:
   - Lepas update env variables, kena redeploy
   - Or restart service

5. **Custom Domain**:
   - Go to Settings > Custom Domain
   - Add your domain
   - Update DNS records

---

## 📞 Quick Commands Reference

### Render Shell Commands:
```bash
# Check status
php artisan --version
php -v
php -m

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Database
php artisan migrate:status
php artisan migrate --force
php artisan db:seed --force

# Test database connection
php artisan tinker
DB::connection()->getPdo();
exit

# View logs
tail -f storage/logs/laravel.log
```

---

## ✅ Final Checklist

- [ ] Service deployed successfully
- [ ] Environment variables added
- [ ] Database connected
- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] API endpoints working
- [ ] Frontend connected
- [ ] CORS configured

---

**Sekarang backend anda dah live! 🎉**

**Service URL**: https://durian-backend-xxxx.onrender.com

**Next**: Deploy frontend ke Vercel!
