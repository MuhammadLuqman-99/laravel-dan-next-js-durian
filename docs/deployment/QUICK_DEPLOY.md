# ⚡ Quick Deploy Guide - 10 Minit!

Deploy full-stack app dalam 10 minit je!

---

## ✅ Prerequisites

- GitHub account
- Render account (signup free: render.com)
- Vercel account (signup free: vercel.com)

---

## 🗂️ Step 1: Database (2 minit)

1. Login Render: https://dashboard.render.com
2. **New +** → **PostgreSQL**
3. Name: `durian-database`
4. Region: **Singapore**
5. Plan: **Free**
6. Click **Create Database**
7. **COPY credentials** - you'll need them!

---

## 🖥️ Step 2: Backend (3 minit)

1. Still in Render
2. **New +** → **Web Service**
3. Connect GitHub: `laravel-dan-next-js-durian`
4. Configure:
   ```
   Name: durian-backend
   Region: Singapore
   Branch: main
   Root Directory: [leave empty]
   Runtime: Docker
   Plan: Free
   ```

5. **Environment Variables** - Add these:
   ```
   APP_KEY = base64:eorA23r9mmfKGsqDN4xDCWJ7nywyrp/ExaGK+KBAnYE=
   APP_ENV = production
   APP_DEBUG = false

   DB_CONNECTION = pgsql
   DB_HOST = [paste from Step 1]
   DB_PORT = 5432
   DB_DATABASE = durian_farm
   DB_USERNAME = [paste from Step 1]
   DB_PASSWORD = [paste from Step 1]

   SESSION_DRIVER = database
   CACHE_STORE = database
   LOG_CHANNEL = stderr
   ```

6. Click **Create Web Service**
7. Wait ~5 minutes for deploy
8. **COPY backend URL** when done!

---

## 🎨 Step 3: Frontend (3 minit)

1. Login Vercel: https://vercel.com
2. **Add New** → **Project**
3. Import: `laravel-dan-next-js-durian`
4. Configure:
   ```
   Framework: Vite
   Root Directory: durian-frontend  ← IMPORTANT!
   Build Command: npm run build
   Output Directory: dist
   ```

5. **Environment Variable**:
   ```
   VITE_API_URL = [paste backend URL]/api
   ```
   Example: `https://durian-backend-b9u2.onrender.com/api`

6. Click **Deploy**
7. Wait ~2 minutes
8. **COPY frontend URL** when done!

---

## 🔗 Step 4: Connect (2 minit)

Update backend CORS:

1. Go back to **Render** → **durian-backend**
2. **Environment** tab → **Add Variable**:
   ```
   CORS_ALLOWED_ORIGINS = [paste frontend URL]
   ```
   Example: `https://durian-farm-xyz.vercel.app`

3. Service auto-redeploys (~2 min)

---

## ✅ Step 5: Test!

1. Open frontend URL
2. Login:
   ```
   Email: admin@durian.com
   Password: password
   ```
3. Done! 🎉

---

## 📋 Quick Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database credentials copied
- [ ] Backend deployed with env variables
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend has VITE_API_URL set
- [ ] CORS configured in backend
- [ ] Login tested successfully

---

## ❌ If Error

### Backend won't start
- Check logs in Render
- Verify all environment variables set
- Make sure DB credentials correct

### Frontend CORS error
- Add your Vercel URL to CORS_ALLOWED_ORIGINS
- Wait for backend to redeploy
- Hard refresh browser (Ctrl+F5)

### Can't login
- Check backend logs
- Verify database seeded (should auto-seed)
- Try: `admin@durian.com` / `password`

---

## 🎯 Expected URLs

```
Database:  Internal - dpg-xxx.render.com
Backend:   https://durian-backend-xxx.onrender.com
Frontend:  https://durian-farm-xxx.vercel.app
```

---

## 📖 Need More Help?

- [Full Render Guide](RENDER.md)
- [Full Vercel Guide](VERCEL.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

**Total Time**: ~10 minutes
**Cost**: RM 0 (100% free tier)
**Status**: Production ready! ✅
