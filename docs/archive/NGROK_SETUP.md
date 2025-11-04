# Ngrok Setup - Test on Phone/WiFi

## What is Ngrok?

Ngrok creates a secure tunnel from internet to your localhost. Perfect untuk:
- ✅ Test app on your phone (same WiFi or different network)
- ✅ Test PWA features (needs HTTPS)
- ✅ Test with friends/clients before deployment
- ✅ Test offline sync on mobile device

## Architecture

```
Your Phone          Internet          Your Computer
(WiFi/4G)                            (localhost)
    │                                     │
    │    https://abc123.ngrok.io         │
    ├──────────────────────────────────► │
    │                                     │
    │         Backend API                 │
    │    http://localhost:8000            │
    │                                     │
    │         Frontend                    │
    │    http://localhost:5173            │
    │                                     │
```

---

## Step 1: Install Ngrok

### Download Ngrok
1. Go to https://ngrok.com
2. Sign up (free account)
3. Download ngrok for Windows
4. Extract to a folder (e.g., `C:\ngrok\`)

### Add to PATH (Optional)
```bash
# Add C:\ngrok\ to Windows PATH
# Or just use full path: C:\ngrok\ngrok.exe
```

### Authenticate
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Get auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

---

## Step 2: Run Backend with Ngrok

### 2.1 Start Laravel Backend
```bash
cd durian-backend
php artisan serve
# Running on http://localhost:8000
```

### 2.2 Create Ngrok Tunnel for Backend
**Open NEW terminal:**

```bash
ngrok http 8000
```

You'll see:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       25ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**IMPORTANT:** Copy the HTTPS URL: `https://abc123xyz.ngrok.io`

**⚠️ This URL changes every time you restart ngrok (Free plan)**

---

## Step 3: Configure Backend for Ngrok

### 3.1 Update .env

File: `durian-backend/.env`

```env
APP_URL=https://abc123xyz.ngrok.io

# Update CORS
FRONTEND_URL=https://def456ghi.ngrok.io
SANCTUM_STATEFUL_DOMAINS=def456ghi.ngrok.io,localhost:5173
```

### 3.2 Update config/cors.php

File: `durian-backend/config/cors.php`

```php
'allowed_origins' => [
    'http://localhost:5173',
    'https://*.ngrok.io',  // Allow all ngrok tunnels
    'https://*.ngrok-free.app', // New ngrok domain
],
```

### 3.3 Clear Laravel Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### 3.4 Test Backend
Open browser and go to:
```
https://abc123xyz.ngrok.io/api/pokok
```

Should see JSON response! ✅

---

## Step 4: Run Frontend with Ngrok

### 4.1 Update Frontend API URL

File: `durian-frontend/.env.local` (create if not exists)

```env
VITE_API_URL=https://abc123xyz.ngrok.io/api
```

### 4.2 Start Frontend
```bash
cd durian-frontend
npm run dev
# Running on http://localhost:5173
```

### 4.3 Create Ngrok Tunnel for Frontend
**Open ANOTHER new terminal:**

```bash
ngrok http 5173
```

You'll see:
```
Forwarding                    https://def456ghi.ngrok.io -> http://localhost:5173
```

**Copy this URL:** `https://def456ghi.ngrok.io`

### 4.4 Update Backend .env Again

Go back to `durian-backend/.env`:

```env
FRONTEND_URL=https://def456ghi.ngrok.io
SANCTUM_STATEFUL_DOMAINS=def456ghi.ngrok.io
```

Clear cache:
```bash
php artisan config:clear
```

---

## Step 5: Test on Phone!

### 5.1 Open on Phone
1. Open browser on phone
2. Go to: `https://def456ghi.ngrok.io`
3. You should see your durian farm app! 🎉

### 5.2 Test Login
1. Login with: admin@durian.com / password
2. Should work! ✅

### 5.3 Test CRUD
1. Navigate to Spray page
2. Create new record
3. Should save to your laptop's MySQL! ✅

### 5.4 Test Offline Mode
1. Turn off phone WiFi/data
2. Create spray record
3. Should queue: "1 pending"
4. Turn WiFi back on
5. Auto-sync! ✅

### 5.5 Test PWA Installation
1. On Android Chrome: Menu → "Install app"
2. On iOS Safari: Share → "Add to Home Screen"
3. App installs like native app! ✅

---

## Alternative: Easier Single-Tunnel Setup

Instead of running 2 ngrok tunnels, you can use ngrok for backend only:

### Option A: Ngrok Backend + Local Frontend with Tailscale/Twingate

Use Tailscale to connect phone to your computer's network:
1. Install Tailscale on computer and phone
2. Frontend stays on `http://100.x.x.x:5173` (Tailscale IP)
3. Backend on ngrok for HTTPS

### Option B: Use Vite's --host Flag

```bash
# Frontend
npm run dev -- --host
# Now accessible on local network as http://192.168.x.x:5173
```

But PWA requires HTTPS, so still need ngrok for production testing.

---

## Ngrok Web Interface

While ngrok is running, you can monitor traffic:

Open browser: `http://localhost:4040`

You'll see:
- All HTTP requests
- Request/response details
- Timing information
- Replay requests

Very useful for debugging! 🔧

---

## Common Issues

### Issue 1: Ngrok URL Changes

**Problem:** Every restart = new URL

**Solution (Free Plan):**
- Update .env files each time
- Or use Ngrok paid plan ($8/month) for static domain

**Temporary Solution:**
Create a script to update .env automatically:

File: `update-ngrok-urls.bat`

```batch
@echo off
set /p BACKEND_URL="Enter backend ngrok URL (https://xxx.ngrok.io): "
set /p FRONTEND_URL="Enter frontend ngrok URL (https://yyy.ngrok.io): "

echo VITE_API_URL=%BACKEND_URL%/api > durian-frontend\.env.local
echo APP_URL=%BACKEND_URL% > durian-backend\.env.ngrok
echo FRONTEND_URL=%FRONTEND_URL% >> durian-backend\.env.ngrok

echo URLs updated!
pause
```

### Issue 2: CORS Still Not Working

**Solution:**
1. Check ngrok URL is in `allowed_origins`
2. Clear browser cache
3. Clear Laravel cache: `php artisan config:clear`
4. Restart both backend and ngrok

### Issue 3: Session/Authentication Issues

**Problem:** Login works but immediately logs out

**Solution:**
Update `durian-backend/.env`:

```env
SESSION_DRIVER=cookie
SESSION_DOMAIN=.ngrok.io
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=abc123xyz.ngrok.io,def456ghi.ngrok.io
```

### Issue 4: Images Not Loading

**Problem:** Photos uploaded but not showing

**Solution:**
1. Make sure storage link exists:
   ```bash
   php artisan storage:link
   ```

2. Check image URLs in browser console
3. Should be: `https://abc123xyz.ngrok.io/storage/inspeksi/photo.jpg`

### Issue 5: Slow Performance

**Problem:** App is slow on phone

**Reason:** Free ngrok routes through US servers

**Solution:**
- Use `--region ap` for Asia Pacific:
  ```bash
  ngrok http 8000 --region ap
  ```
- Or upgrade to Ngrok paid plan for better routing

---

## Running Both Tunnels at Once

### Using Windows Terminal (Recommended)

Create tabs for each:

**Tab 1: Backend**
```bash
cd durian-backend
php artisan serve
```

**Tab 2: Backend Ngrok**
```bash
ngrok http 8000 --region ap
```

**Tab 3: Frontend**
```bash
cd durian-frontend
npm run dev
```

**Tab 4: Frontend Ngrok**
```bash
ngrok http 5173 --region ap
```

### Using batch script

File: `start-ngrok-dev.bat`

```batch
@echo off
echo Starting Durian Farm Development with Ngrok...

start "Backend Server" cmd /k "cd durian-backend && php artisan serve"
timeout /t 3

start "Backend Ngrok" cmd /k "ngrok http 8000 --region ap"
timeout /t 3

start "Frontend Server" cmd /k "cd durian-frontend && npm run dev"
timeout /t 3

start "Frontend Ngrok" cmd /k "ngrok http 5173 --region ap"

echo All services started!
echo.
echo 1. Check ngrok terminals for URLs
echo 2. Update .env files with ngrok URLs
echo 3. Clear Laravel cache: php artisan config:clear
echo 4. Open frontend ngrok URL on your phone!
pause
```

---

## Testing Checklist

Test these on your phone:

✅ **Basic Functionality:**
- [ ] Login works
- [ ] Dashboard loads
- [ ] All pages accessible
- [ ] Menu navigation works

✅ **CRUD Operations:**
- [ ] Create spray record
- [ ] Edit record
- [ ] Delete record
- [ ] View lists

✅ **Offline Mode:**
- [ ] Go offline → See red banner
- [ ] Create record offline → "1 pending"
- [ ] Go online → Auto-sync
- [ ] Manual sync button works

✅ **PWA Features:**
- [ ] Install prompt appears
- [ ] Install to home screen
- [ ] Opens as standalone app
- [ ] Splash screen shows
- [ ] Offline indicator works

✅ **Image Upload:**
- [ ] Camera capture works
- [ ] Photo preview shows
- [ ] Upload succeeds
- [ ] Photo displays in list

✅ **Weather Widget:**
- [ ] Weather loads
- [ ] Spray recommendations show
- [ ] 3-day forecast displays

---

## Ngrok Free Tier Limits

**Free Plan:**
- ✅ 1 ngrok process at a time (need 2 accounts for backend + frontend)
- ✅ Random URLs (change on restart)
- ✅ 40 connections/minute
- ✅ Perfect for testing!

**If you need:**
- 📦 **Static domains:** Ngrok Pro ($8/month)
- 📦 **Multiple tunnels:** Ngrok Pro
- 📦 **Better performance:** Ngrok Pro + region selection

**Alternative Free Options:**
- **LocalTunnel:** `npm install -g localtunnel`
- **Serveo:** `ssh -R 80:localhost:8000 serveo.net`
- **Cloudflare Tunnel:** Free, static domains

---

## When You're Done Testing

### Stop All Services

Press `Ctrl+C` in each terminal:
1. Stop frontend ngrok
2. Stop backend ngrok
3. Stop frontend dev server
4. Stop backend server

### Revert .env Files

Remove ngrok URLs:

`durian-backend/.env`:
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost
```

`durian-frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Summary

**Ngrok Perfect Untuk:**
✅ Test on real phone quickly
✅ Test PWA installation
✅ Test offline sync on mobile
✅ Show client/farmer demo
✅ Test before real deployment

**For Production:**
Use Vercel + Render instead (permanent URLs, better performance, free tier)

---

**Ready to try? Nak saya walk through step-by-step sekarang?** 📱
