# Deployment Guide - Vercel (Frontend) + Render (Backend)

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  User's Browser/Mobile                  │
│  - PWA installed                        │
│  - Offline capable                      │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│  Vercel (Frontend)                      │
│  - React App                            │
│  - Static files                         │
│  - Service Worker                       │
│  URL: durian-farm.vercel.app            │
└──────────────┬──────────────────────────┘
               │
               │ API calls (CORS enabled)
               ▼
┌─────────────────────────────────────────┐
│  Render (Backend)                       │
│  - Laravel API                          │
│  - MySQL Database                       │
│  - File Storage                         │
│  URL: durian-api.onrender.com           │
└─────────────────────────────────────────┘
```

## Why This Setup Works Perfectly:

✅ **Free Tier Available** - Both platforms have free options
✅ **HTTPS by Default** - Required for PWA
✅ **Auto Deploy from Git** - Push to GitHub → Auto deploy
✅ **CORS Supported** - Frontend can call backend API
✅ **Good Performance** - CDN for frontend, optimized backend
✅ **Offline Works** - Service worker caches API responses

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Production

#### 1.1 Update .env.example

Already done! But verify durian-backend/.env.example has:

```env
APP_NAME=DurianFarm
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://durian-api.onrender.com

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=cookie
QUEUE_CONNECTION=sync

SANCTUM_STATEFUL_DOMAINS=durian-farm.vercel.app
FRONTEND_URL=https://durian-farm.vercel.app
```

#### 1.2 Update CORS Configuration

File: `durian-backend/config/cors.php`

Make sure it has:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'https://durian-farm.vercel.app',
        'https://*.vercel.app', // Allow all Vercel preview deployments
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

#### 1.3 Create Build Script

File: `durian-backend/render-build.sh` (already exists, verify):

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
```

Make executable:
```bash
chmod +x render-build.sh
```

#### 1.4 Create render.yaml

File: `durian-backend/render.yaml` (already exists, verify):

```yaml
services:
  - type: web
    name: durian-backend
    env: php
    buildCommand: "./render-build.sh"
    startCommand: "php artisan serve --host=0.0.0.0 --port=$PORT"
    envVars:
      - key: APP_KEY
        generateValue: true
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: false
      - key: DATABASE_URL
        fromDatabase:
          name: durian-db
          property: connectionString
      - key: FRONTEND_URL
        value: https://durian-farm.vercel.app

databases:
  - name: durian-db
    databaseName: durian_farm
    user: durian_user
```

### Step 2: Deploy to Render

#### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### 2.2 Create MySQL Database
1. Click **New +** → **PostgreSQL** (or use external MySQL)
2. Name: `durian-db`
3. Database: `durian_farm`
4. User: `durian_user`
5. Plan: **Free**
6. Click **Create Database**
7. Wait for provisioning (~2 minutes)
8. Copy **Internal Database URL**

**Alternative: Use Railway MySQL (Better Free Tier)**
- Railway offers MySQL directly
- Render free tier uses PostgreSQL
- For MySQL on Render, need paid plan OR external MySQL

#### 2.3 Create Web Service
1. Click **New +** → **Web Service**
2. Connect to repository: `laravel-dan-next-js-durian`
3. Name: `durian-backend`
4. Root Directory: `durian-backend`
5. Environment: **Docker** or **Native**
6. Build Command: `./render-build.sh`
7. Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`

#### 2.4 Set Environment Variables
In Render dashboard → Environment:

```
APP_NAME=DurianFarm
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxxxxxxxxxxxx  (auto-generated)
APP_URL=https://durian-backend-xxxx.onrender.com

DB_CONNECTION=mysql
DB_HOST={your-db-host}
DB_PORT=3306
DB_DATABASE=durian_farm
DB_USERNAME=durian_user
DB_PASSWORD={your-db-password}

SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=durian-farm.vercel.app,localhost:5173
FRONTEND_URL=https://durian-farm.vercel.app
```

#### 2.5 Deploy
1. Click **Create Web Service**
2. Wait for build (~5-10 minutes)
3. Check logs for errors
4. Once deployed, note your URL: `https://durian-backend-xxxx.onrender.com`

#### 2.6 Test Backend
```bash
curl https://durian-backend-xxxx.onrender.com/api/health

# Should return:
{"status": "ok"}
```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

#### 1.1 Create Production Environment File

File: `durian-frontend/.env.production`

```env
VITE_API_URL=https://durian-backend-xxxx.onrender.com/api
```

#### 1.2 Update Service Worker Cache Patterns

File: `durian-frontend/vite.config.js`

Update cache patterns to include production URL:

```javascript
workbox: {
  runtimeCaching: [
    {
      // API GET requests - works for both local and production
      urlPattern: ({ request, url }) => {
        return request.method === 'GET' &&
               url.pathname.startsWith('/api/');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-get-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24
        }
      }
    },
    {
      // Images - production storage
      urlPattern: /^https:\/\/durian-backend.*\.onrender\.com\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    }
    // ... rest of cache patterns
  ]
}
```

#### 1.3 Update offlineApi.js

File: `durian-frontend/src/utils/offlineApi.js`

Already uses relative paths, so should work! But verify:

```javascript
// ✅ Good - relative path
await api.get('/spray');

// ❌ Bad - hardcoded localhost
await api.get('http://localhost:8000/api/spray');
```

#### 1.4 Create vercel.json

File: `durian-frontend/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy to Vercel

#### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import repository: `laravel-dan-next-js-durian`

#### 2.2 Configure Project
1. **Project Name**: `durian-farm`
2. **Framework Preset**: Vite
3. **Root Directory**: `durian-frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

#### 2.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://durian-backend-xxxx.onrender.com/api
```

Make sure to set for **Production**, **Preview**, and **Development**

#### 2.4 Deploy
1. Click **Deploy**
2. Wait for build (~2-3 minutes)
3. Your app is live at: `https://durian-farm.vercel.app`

#### 2.5 Enable HTTPS (Automatic)
Vercel automatically provides SSL certificate ✅

### Step 3: Update Backend CORS

Now that you have Vercel URL, update backend:

#### 3.1 On Render Dashboard
Go to Environment Variables and update:

```
FRONTEND_URL=https://durian-farm.vercel.app
SANCTUM_STATEFUL_DOMAINS=durian-farm.vercel.app
```

#### 3.2 Redeploy Backend
Click **Manual Deploy** → **Deploy latest commit**

---

## Part 3: Testing Production Setup

### Test 1: API Connection

Open browser console on `https://durian-farm.vercel.app`:

```javascript
// Check if API URL is correct
console.log(import.meta.env.VITE_API_URL);
// Should show: https://durian-backend-xxxx.onrender.com/api

// Test API call
fetch('https://durian-backend-xxxx.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d));
// Should return: {status: "ok"}
```

### Test 2: Login

1. Go to `https://durian-farm.vercel.app/login`
2. Login with: admin@durian.com / password
3. Should redirect to dashboard ✅

### Test 3: CRUD Operations

1. Navigate to Spray page
2. Create new spray record
3. Check if saved in database
4. Edit record
5. Delete record

All should work! ✅

### Test 4: Offline Mode

1. Open DevTools → Network → Offline
2. Create spray record
3. Should queue for sync
4. Go back online
5. Should auto-sync to production backend ✅

### Test 5: PWA Installation

1. Visit on mobile or desktop
2. Browser prompts "Install app"
3. Click Install
4. App opens as standalone
5. Offline mode works ✅

### Test 6: Image Upload

1. Create inspeksi with photo
2. Photo should upload to Render storage
3. Photo should display in app ✅

---

## Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Check `config/cors.php` has Vercel URL
2. Check `SANCTUM_STATEFUL_DOMAINS` has Vercel domain
3. Redeploy backend after changes

### Issue 2: 500 Server Error

**Error:** Backend returns 500

**Solution:**
1. Check Render logs
2. Usually: Missing APP_KEY or DB connection
3. Run: `php artisan key:generate` on Render shell
4. Update environment variables

### Issue 3: Database Connection Failed

**Error:** `SQLSTATE[HY000]`

**Solution:**
1. Verify DB credentials in Render dashboard
2. Check database is running
3. Test connection from Render shell:
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

### Issue 4: Storage Link Not Working

**Error:** Images not loading

**Solution:**
1. SSH into Render:
   ```bash
   php artisan storage:link
   ```
2. Or add to `render-build.sh`

### Issue 5: Build Failed on Vercel

**Error:** Build command failed

**Solution:**
1. Check `package.json` has correct scripts
2. Verify `vite.config.js` is correct
3. Check build logs for missing dependencies

### Issue 6: Offline Sync Not Working

**Error:** Data not syncing in production

**Solution:**
1. Check service worker is registered
2. DevTools → Application → Service Workers
3. Check IndexedDB has pending actions
4. Verify API URL is production URL

---

## Monitoring & Maintenance

### Check Backend Logs (Render)
```bash
# In Render dashboard → Logs
# Or use Render CLI:
render logs -s durian-backend --tail
```

### Check Frontend Logs (Vercel)
```bash
# In Vercel dashboard → Deployments → View Function Logs
```

### Database Backups (Important!)

**Render Free Tier:** No automatic backups

**Solution:** Manual backup via Laravel command

```bash
# Add to durian-backend
php artisan db:backup

# Or export via phpMyAdmin
# Or use external backup service
```

### Performance Optimization

**Frontend (Vercel):**
- Already optimized with Vite
- Edge caching enabled
- Gzip compression automatic

**Backend (Render):**
- Enable Laravel caching:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

---

## Auto Deploy Setup

### Push to GitHub = Auto Deploy

Both Vercel and Render watch your GitHub repo:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```
3. **Vercel auto-deploys** frontend (~2 min)
4. **Render auto-deploys** backend (~5 min)
5. **Changes live!** ✅

### Preview Deployments (Vercel)

Every pull request gets preview URL:
- `https://durian-farm-git-feature-x.vercel.app`
- Test before merging to main
- Automatic cleanup after merge

---

## Cost Breakdown (Free Tier)

### Vercel Free:
✅ 100GB bandwidth/month
✅ Unlimited deployments
✅ HTTPS included
✅ Edge caching
✅ Perfect for this project!

### Render Free:
✅ 750 hours/month (enough for 1 service)
✅ MySQL database
✅ Auto-deploy from Git
✅ HTTPS included
⚠️ Sleeps after 15 min inactivity (wakes in ~30 sec)

### Upgrade When Needed:
- Vercel Pro: $20/month (more bandwidth)
- Render Starter: $7/month (no sleep, better performance)

---

## Security Checklist

Before going live:

✅ Change default admin password
✅ APP_DEBUG=false in production
✅ Verify CORS origins
✅ Enable rate limiting
✅ Set up monitoring (Sentry/LogRocket)
✅ Regular database backups
✅ Keep dependencies updated
✅ Use environment secrets properly

---

## Next Steps

1. **Commit preparation changes:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Deploy backend to Render**
   - Follow Part 1 steps
   - Get backend URL

3. **Deploy frontend to Vercel**
   - Follow Part 2 steps
   - Use backend URL in env

4. **Test everything**
   - Follow Part 3 tests
   - Fix any issues

5. **Share with farmers!** 🌾
   - Give them app URL
   - Show how to install PWA
   - Train on offline mode

---

**Ready to deploy? Let me know if nak saya help setup step-by-step!** 🚀
