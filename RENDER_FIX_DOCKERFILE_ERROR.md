# 🔧 FIX: "Dockerfile not found" Error

## ❌ Error Message:
```
error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

## 🎯 Root Cause:
Render masih configure **Root Directory = `durian-backend`** tapi Dockerfile sekarang dah move ke root!

---

## ✅ Solution 1: Update Render Settings (RECOMMENDED)

### Step 1: Go to Render Dashboard
1. Login: https://dashboard.render.com/
2. Click your service: `durian-backend`
3. Click **"Settings"** tab

### Step 2: Update Root Directory
Scroll down to **"Build & Deploy"** section:

**BEFORE** (Wrong):
```
Root Directory: durian-backend
```

**AFTER** (Correct):
```
Root Directory: [Leave EMPTY or put "./"]
```

### Step 3: Save & Redeploy
1. Click **"Save Changes"**
2. Go back to main page
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Solution 2: Delete & Recreate Service (FASTEST)

Kalau settings tak work, buat baru:

### Step 1: Delete Old Service
1. Go to Settings tab
2. Scroll ke bottom
3. Click **"Delete Web Service"**
4. Type service name to confirm

### Step 2: Create New Service
1. Click **"New +"** → **"Web Service"**
2. Select repo: `laravel-dan-next-js-durian`
3. **IMPORTANT**:
   ```
   Name: durian-backend
   Region: Singapore
   Branch: main
   Root Directory: [LEAVE EMPTY!]  👈 THIS IS KEY!
   Runtime: Docker
   ```
4. Click **"Create Web Service"**

### Step 3: Add Environment Variables
**BEFORE deploy**, add ALL environment variables from `RENDER_ENV_COPY_PASTE.txt`:

Minimum required:
```
APP_KEY = base64:eorA23r9mmfKGsqDN4xDCWJ7nywyrp/ExaGK+KBAnYE=
APP_ENV = production
APP_DEBUG = false

DB_CONNECTION = pgsql
DB_HOST = dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
DB_PORT = 5432
DB_DATABASE = durian_farm
DB_USERNAME = durian_farm_user
DB_PASSWORD = F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr

SESSION_DRIVER = database
CACHE_STORE = database
LOG_CHANNEL = stderr
```

### Step 4: Deploy!
Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Solution 3: Use render.yaml Blueprint

### Step 1: Update render.yaml in Dashboard
Go to **"Blueprint"** tab, paste this:

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

Then add environment variables manually.

---

## 🔍 Verify Configuration

After changing settings, verify:

### 1. Check Root Directory:
Settings → Build & Deploy → Root Directory = **EMPTY** or **"./"**

### 2. Check Dockerfile Path:
Settings → Build & Deploy → Docker Command = **NOT SET** (auto-detect)

### 3. Check Branch:
Settings → Build & Deploy → Branch = **main**

### 4. Check Auto-Deploy:
Settings → Build & Deploy → Auto-Deploy = **ON**

---

## 📋 Current File Structure

Your repo structure (correct):
```
laravel-dan-next-js-durian/          👈 Root (Render should point here!)
├── Dockerfile                        👈 Render reads this
├── render.yaml                       👈 Configuration file
├── durian-backend/                   👈 Laravel code here
│   ├── app/
│   ├── public/
│   ├── composer.json
│   └── ...
└── durian-frontend/
    └── ...
```

Dockerfile copies from `durian-backend/`:
```dockerfile
COPY durian-backend/ .
```

---

## ❓ How to Check Current Settings

### Method 1: Render Dashboard
1. Go to your service
2. Settings tab
3. Look for "Root Directory" field

### Method 2: Check Build Logs
Build logs will show:
```
==> Cloning from https://github.com/...
==> Checking out commit ...
==> Looking for Dockerfile in: [ROOT_DIR]
```

If shows `durian-backend/Dockerfile` = WRONG
Should show `./Dockerfile` or `Dockerfile` = CORRECT

---

## 🎯 Expected Successful Build Log

After fix, you should see:
```
==> Cloning from https://github.com/MuhammadLuqman-99/laravel-dan-next-js-durian
==> Checking out commit 8ca2a03...
==> Building Docker image
#1 [internal] load build definition from Dockerfile
#1 DONE
#2 [1/8] FROM php:8.2-fpm
#2 DONE
#3 [2/8] RUN apt-get update && apt-get install -y...
...
==> Build successful!
```

---

## 💡 Why This Happens

**Before**:
- You had `durian-backend` as submodule
- Render was configured with `Root Directory = durian-backend`
- Dockerfile was inside that folder

**Now**:
- Dockerfile moved to root
- But Render still configured with old root directory
- Render looks in wrong place!

**Fix**: Update Render to use repo root (empty Root Directory)

---

## ✅ Quick Checklist

Before deploying again:

- [ ] Root Directory = EMPTY or "./"
- [ ] Dockerfile exists in repo root (✓ already have)
- [ ] render.yaml exists in repo root (✓ already have)
- [ ] Environment variables added
- [ ] Branch = main
- [ ] Latest commit = 8ca2a03 or newer

---

## 🚀 After Fix Works

You should see successful build, then:

1. **Test API**:
   ```
   https://your-service.onrender.com/api/zones
   ```

2. **Create admin user** (Shell tab):
   ```bash
   php artisan tinker
   ```
   ```php
   $user = new \App\Models\User();
   $user->name = 'Admin';
   $user->email = 'admin@durianfarm.com';
   $user->password = bcrypt('admin123');
   $user->role = 'admin';
   $user->save();
   ```

3. **Seed data**:
   ```bash
   php artisan db:seed --class=BusutSeeder --force
   ```

---

**TRY NOW**: Go to Render → Settings → Clear "Root Directory" → Save → Deploy! 🚀
