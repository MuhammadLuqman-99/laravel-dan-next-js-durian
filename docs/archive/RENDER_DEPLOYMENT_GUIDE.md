# 🚀 Render.com Deployment Guide - Durian Farm Backend

Complete step-by-step guide untuk deploy Laravel backend ke Render.com

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Render.com account (free)
- ✅ Backend code sudah push ke GitHub

---

## 🎯 Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

---

## 🗄️ Step 2: Create MySQL Database (PENTING!)

### Option A: Render PostgreSQL (RECOMMENDED - FREE)
Render provide PostgreSQL free, bukan MySQL. Laravel support both!

1. From Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `durian-db`
   - **Database**: `durian`
   - **User**: (auto-generated)
   - **Region**: `Singapore` (closest to Malaysia)
   - **Plan**: **FREE** ✅
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to provision
6. **SAVE** these credentials (will need later):
   - Internal Database URL
   - External Database URL
   - Username
   - Password

### Option B: External MySQL (Alternatives)
If you really need MySQL, use external services:

#### FreeMySQLHosting.net (FREE)
- Go to: https://www.freemysqlhosting.net/
- Create free database
- Get: hostname, username, password, database name

#### PlanetScale (FREE Tier)
- Go to: https://planetscale.com/
- Create free MySQL database
- Better than FreeMySQLHosting but need credit card

---

## 🛠️ Step 3: Prepare Laravel for PostgreSQL (If using Render DB)

Your `durian-backend/.env` should have:

```env
DB_CONNECTION=pgsql  # Changed from mysql
DB_HOST=dpg-xxxxx.singapore-postgres.render.com
DB_PORT=5432
DB_DATABASE=durian
DB_USERNAME=durian_user
DB_PASSWORD=xxxxx
```

**No code changes needed!** Laravel supports PostgreSQL out of the box.

---

## 🚀 Step 4: Deploy Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Select your **durian-backend** repo (or the repo containing backend)
   - If not visible, click **"Configure account"** to grant access
5. Click **"Connect"**

### Configure Web Service:

**Basic Settings:**
- **Name**: `durian-backend`
- **Region**: `Singapore`
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank (or `durian-backend` if it's a subfolder)
- **Runtime**: `PHP`
- **Build Command**:
  ```bash
  ./render-build.sh
  ```
- **Start Command**:
  ```bash
  php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
  ```

**Instance Type:**
- Select: **FREE** ✅

---

## 🔐 Step 5: Environment Variables

Scroll down to **"Environment Variables"** section and add these:

### Required Variables:

```env
APP_NAME="Durian Farm System"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://durian-backend.onrender.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database (Use your Render PostgreSQL credentials)
DB_CONNECTION=pgsql
DB_HOST=<your-render-db-host>
DB_PORT=5432
DB_DATABASE=durian
DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# CORS (Important!)
FRONTEND_URL=https://durian-frontend.vercel.app

# Optional: File Storage
FILESYSTEM_DISK=public
```

### 🔑 Generate APP_KEY:

Run locally:
```bash
cd durian-backend
php artisan key:generate --show
```

Copy the output (e.g., `base64:xxxxx`) and paste as `APP_KEY` value.

---

## ⚡ Step 6: Deploy!

1. Click **"Create Web Service"**
2. Render will start building (takes 5-10 minutes first time)
3. Watch the logs for any errors
4. Wait for status: **"Live"** ✅

Your backend will be at: `https://durian-backend.onrender.com`

---

## ✅ Step 7: Verify Deployment

Test these endpoints:

1. **Health Check**:
   ```
   https://durian-backend.onrender.com/
   ```
   Should return Laravel welcome page or API response

2. **Login Test**:
   ```
   POST https://durian-backend.onrender.com/api/login
   Body: {
     "email": "admin@durian.com",
     "password": "password"
   }
   ```

---

## 🔧 Step 8: Update Frontend to Use New Backend

Update your frontend `.env`:

```env
VITE_API_URL=https://durian-backend.onrender.com/api
```

Push to Vercel and test!

---

## ⚠️ Common Issues & Solutions

### Issue 1: "502 Bad Gateway"
**Solution**: Check logs in Render dashboard. Usually means:
- Build failed
- Start command wrong
- Port not binding correctly

### Issue 2: "Database connection failed"
**Solution**:
- Double-check DB credentials in Environment Variables
- Make sure DB_CONNECTION matches your database type (pgsql or mysql)
- Check if database is actually running

### Issue 3: "CORS Error from Frontend"
**Solution**:
- Make sure `FRONTEND_URL` is set correctly
- Check `config/cors.php` allows your frontend domain

### Issue 4: "500 Internal Server Error"
**Solution**:
- Set `APP_DEBUG=true` temporarily to see error
- Check logs in Render dashboard
- Usually permission or missing file issues

### Issue 5: "Free Instance Spins Down" (Slow Wake-Up)
**Note**: Free tier spins down after 15 minutes of inactivity.
- First request after downtime: 30-60 seconds
- Subsequent requests: Fast
- **Solution**: Upgrade to paid ($7/month) for 24/7 uptime

---

## 📊 Monitoring

### View Logs:
1. Go to Render Dashboard
2. Click your **durian-backend** service
3. Click **"Logs"** tab
4. See real-time logs

### View Metrics:
- Check **"Metrics"** tab for:
  - Request count
  - Response times
  - Memory usage

---

## 💰 Cost Breakdown

**FREE TIER (What you're using):**
- ✅ Web Service: FREE (with limitations)
- ✅ PostgreSQL Database: FREE (1GB storage)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 750 hours/month free (enough for testing)

**PAID ($7/month per service):**
- ✅ No sleep
- ✅ Always-on 24/7
- ✅ Faster performance
- ✅ More resources

---

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to GitHub!

**To disable auto-deploy:**
1. Go to service settings
2. Scroll to **"Auto-Deploy"**
3. Toggle off

**Manual deploy:**
- Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📝 Checklist

Before going live, ensure:

- [ ] Database created and credentials saved
- [ ] All environment variables set correctly
- [ ] APP_KEY generated
- [ ] Build script executable: `chmod +x render-build.sh`
- [ ] CORS configured for frontend domain
- [ ] Test all API endpoints
- [ ] Frontend updated with new API URL
- [ ] Database seeded with initial data (admin user)

---

## 🆘 Need Help?

**Render Docs:**
- https://render.com/docs/deploy-php

**Common Commands to Test Locally First:**

```bash
# Test build script
bash render-build.sh

# Test start command
php artisan serve --host=0.0.0.0 --port=8000

# Check migrations
php artisan migrate:status

# Seed database
php artisan db:seed
```

---

## 🎉 Success!

Once deployed, your API will be at:
```
https://durian-backend.onrender.com/api
```

Update frontend and you're live! 🚀🌿

---

**Generated with Claude Code** 🤖
