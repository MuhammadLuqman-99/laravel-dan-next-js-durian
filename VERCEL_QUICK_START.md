# ⚡ QUICK START: Deploy ke Vercel (5 Minit)

## 🎯 Super Fast Method

### Step 1: Go to Vercel
👉 https://vercel.com/

### Step 2: Login dengan GitHub
Click **"Continue with GitHub"**

### Step 3: Import Project
1. Click **"Add New Project"**
2. Find repo: **`laravel-dan-next-js-durian`**
3. Click **"Import"**

### Step 4: Configure
```
Framework Preset: Vite ✅ (auto-detected)
Root Directory: durian-frontend 👈 IMPORTANT!
Build Command: npm run build ✅ (auto-filled)
Output Directory: dist ✅ (auto-filled)
```

### Step 5: Environment Variable
Click **"Environment Variables"**

Add ONE variable:
```
Name: VITE_API_URL
Value: https://durian-backend-b9u2.onrender.com/api
```

### Step 6: Deploy!
Click **"Deploy"** button

⏱️ Wait 2-3 minit...

### Step 7: Done! 🎉
Copy your URL: `https://durian-farm-XXXX.vercel.app`

---

## ✅ Test Login

Open URL, login dengan:
```
Email: admin@durian.com
Password: password
```

---

## 🔧 Fix CORS (If Error)

Kalau login error CORS:

1. Go to **Render Dashboard**
2. Click **durian-backend** service
3. Go to **Environment** tab
4. Add variable:
   ```
   CORS_ALLOWED_ORIGINS = https://durian-farm-XXXX.vercel.app
   ```
   (Replace XXXX dengan your actual URL)
5. Service auto-redeploy

---

## 📱 Install as App

**On Mobile**:
1. Open site in Chrome/Safari
2. Click **"Add to Home Screen"**
3. App appears on home screen! 📲

---

**DONE! Frontend live in 5 minit! 🚀**

Full guide: `VERCEL_DEPLOYMENT.md`
