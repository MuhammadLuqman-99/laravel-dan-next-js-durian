# 🔐 Render Environment Variables Setup Guide

Complete guide untuk setup database dan environment variables di Render.com

---

## 📋 Step 1: Create PostgreSQL Database di Render

### 1.1 Create Database
1. Login ke **Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → Select **"PostgreSQL"**
3. Fill in details:
   ```
   Name: durian-db
   Database: durian_db
   User: (auto-generated)
   Region: Singapore (Southeast Asia)
   PostgreSQL Version: 16 (latest)
   Plan: Free ✅
   ```
4. Click **"Create Database"**
5. Wait 2-3 minutes untuk database provision

### 1.2 Get Database Credentials
Selepas database ready, awak akan nampak page dengan credentials. **COPY SEMUA NI:**

```
Internal Database URL: postgres://user:pass@host/db
External Database URL: postgres://user:pass@host/db

Hostname: dpg-xxxxx-a.singapore-postgres.render.com
Port: 5432
Database: durian_db_xxxxx
Username: durian_db_xxxxx_user
Password: [long random string]
```

⚠️ **SAVE credentials ni somewhere safe!**

---

## 🚀 Step 2: Deploy Web Service

### 2.1 Create Web Service
1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **laravel-dan-next-js-durian**
3. Click **"Connect"**

### 2.2 Configure Service
Fill in the form:

**Basic:**
```
Name: durian-backend
Region: Singapore (Southeast Asia)
Branch: main
Root Directory: durian-backend
```

**Build Settings:**
```
Environment: Docker
Dockerfile Path: ./Dockerfile
Docker Build Context: .
```

**Instance:**
```
Instance Type: Free ($0/month)
```

---

## 🔐 Step 3: Add Environment Variables

Scroll down to **"Environment Variables"** section.

### Method 1: Add One by One

Click **"Add Environment Variable"** untuk setiap variable ni:

#### **APPLICATION**
```
Variable Name: APP_NAME
Value: Sistem Pengurusan Kebun Durian

Variable Name: APP_ENV
Value: production

Variable Name: APP_KEY
Value: base64:vabbjA2+lNhmtQPizxi1d/LpNd3BZuvVw1KzIwZUMYM=

Variable Name: APP_DEBUG
Value: false

Variable Name: APP_URL
Value: https://durian-backend.onrender.com
```

#### **LOGGING**
```
Variable Name: LOG_CHANNEL
Value: stderr

Variable Name: LOG_LEVEL
Value: error
```

#### **DATABASE** ⚠️ IMPORTANT - Use YOUR database credentials from Step 1.2
```
Variable Name: DB_CONNECTION
Value: pgsql

Variable Name: DB_HOST
Value: dpg-xxxxx-a.singapore-postgres.render.com
(Copy from your database "Hostname")

Variable Name: DB_PORT
Value: 5432

Variable Name: DB_DATABASE
Value: durian_db_xxxxx
(Copy from your database "Database")

Variable Name: DB_USERNAME
Value: durian_db_xxxxx_user
(Copy from your database "Username")

Variable Name: DB_PASSWORD
Value: [your-long-password-here]
(Copy from your database "Password")
```

#### **SESSION & CACHE**
```
Variable Name: SESSION_DRIVER
Value: file

Variable Name: SESSION_LIFETIME
Value: 120

Variable Name: CACHE_STORE
Value: file

Variable Name: QUEUE_CONNECTION
Value: sync
```

#### **FILESYSTEM**
```
Variable Name: FILESYSTEM_DISK
Value: public
```

#### **MAIL**
```
Variable Name: MAIL_MAILER
Value: log

Variable Name: MAIL_FROM_ADDRESS
Value: noreply@durianfarm.com

Variable Name: MAIL_FROM_NAME
Value: Sistem Pengurusan Kebun Durian
```

#### **FRONTEND CORS** (Update later after deploy frontend)
```
Variable Name: FRONTEND_URL
Value: http://localhost:5173
(Update to your Vercel URL later)

Variable Name: SANCTUM_STATEFUL_DOMAINS
Value: localhost:5173,.vercel.app

Variable Name: CORS_ALLOWED_ORIGINS
Value: http://localhost:5173,https://*.vercel.app
```

---

### Method 2: Bulk Add from .env (Faster!)

1. Click **"Add from .env"**
2. Copy paste content dari `.env.render` file
3. **REPLACE** database values dengan credentials dari Step 1.2
4. Click **"Add Variables"**

---

## ✅ Step 4: Deploy!

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will start building (5-10 minutes)
4. Watch the logs for progress

**Expected logs:**
```
==> Building Docker image
==> Step 1/12 : FROM php:8.2-cli
==> Step 2/12 : RUN apt-get update...
...
==> Running migrations
Migration table created successfully.
Migrating: 2019_12_14_000001_create_personal_access_tokens_table
Migrated:  2019_12_14_000001_create_personal_access_tokens_table
...
==> Server started on 0.0.0.0:8080
✅ Your service is live at https://durian-backend.onrender.com
```

---

## 🧪 Step 5: Test API

### 5.1 Health Check
```bash
curl https://durian-backend.onrender.com
```

Should return: Laravel welcome page or API response

### 5.2 Test Login
```bash
curl -X POST https://durian-backend.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@durian.com",
    "password": "password"
  }'
```

Should return: JWT token

### 5.3 Check if tables created
Login to Render → Go to your database → Click **"Connect"** → Run:
```sql
\dt
```
Should show all Laravel tables (users, pokok_durian, etc.)

---

## 🔧 Step 6: Update Frontend

After backend is live, update your frontend `.env`:

```env
VITE_API_URL=https://durian-backend.onrender.com/api
```

Push to Vercel, then update backend CORS:

**Go back to Render backend → Environment → Edit:**
```
FRONTEND_URL=https://your-app.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-app.vercel.app,.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://*.vercel.app
```

Click **"Save Changes"** → Render will auto-redeploy

---

## 📊 Environment Variables Checklist

Copy this to ensure you have everything:

### ✅ Required (Must Have)
- [ ] APP_NAME
- [ ] APP_ENV (production)
- [ ] APP_KEY
- [ ] APP_DEBUG (false)
- [ ] APP_URL
- [ ] DB_CONNECTION (pgsql)
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_DATABASE
- [ ] DB_USERNAME
- [ ] DB_PASSWORD
- [ ] LOG_CHANNEL (stderr)
- [ ] SESSION_DRIVER (file)
- [ ] CACHE_STORE (file)

### ⚠️ Important (Should Have)
- [ ] FRONTEND_URL
- [ ] SANCTUM_STATEFUL_DOMAINS
- [ ] CORS_ALLOWED_ORIGINS
- [ ] MAIL_MAILER
- [ ] QUEUE_CONNECTION

### 🔵 Optional (Nice to Have)
- [ ] LOG_LEVEL
- [ ] FILESYSTEM_DISK
- [ ] MAIL_FROM_ADDRESS

---

## 🆘 Troubleshooting

### Error: "SQLSTATE[08006] Connection refused"
**Fix:** Wrong database credentials. Double check DB_HOST, DB_USERNAME, DB_PASSWORD

### Error: "No application encryption key has been specified"
**Fix:** Make sure APP_KEY is set. Should start with `base64:`

### Error: "CORS policy"
**Fix:** Update CORS_ALLOWED_ORIGINS with your frontend URL

### Error: "Class not found"
**Fix:** Rebuild with cache clear:
```
Manual Deploy → Clear build cache & deploy
```

---

## 💡 Quick Reference

**Your URLs:**
```
Backend API: https://durian-backend.onrender.com/api
Database: dpg-xxxxx-a.singapore-postgres.render.com:5432
Frontend: https://your-app.vercel.app
```

**Admin Login:**
```
Email: admin@durian.com
Password: password
```

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created
- [ ] All environment variables added
- [ ] Web service deployed successfully
- [ ] API health check returns 200 OK
- [ ] Login endpoint works
- [ ] Database tables created (check via Connect)
- [ ] Frontend updated with backend URL
- [ ] CORS configured correctly
- [ ] Can login from frontend

---

**Generated with Claude Code** 🤖
