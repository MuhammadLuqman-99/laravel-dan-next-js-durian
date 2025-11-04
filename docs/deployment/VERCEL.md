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
# 🚀 Deploy Frontend ke Vercel

## ✅ Prerequisites

Backend sudah deployed:
- ✅ Backend URL: `https://durian-backend-b9u2.onrender.com`
- ✅ Database connected
- ✅ Admin user created
- ✅ API working

---

## 📋 Step 1: Prepare Project

Files already configured:
- ✅ `.env.production` - Production API URL set
- ✅ `vercel.json` - SPA routing configured
- ✅ `package.json` - Build scripts ready

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (EASIEST)

1. **Go to**: https://vercel.com/
2. **Login** with GitHub
3. **Click "Add New Project"**
4. **Import Repository**: `laravel-dan-next-js-durian`
5. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: durian-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Environment Variables** (Click "Add"):
   ```
   VITE_API_URL = https://durian-backend-b9u2.onrender.com/api
   ```

7. **Click "Deploy"**

8. **Wait 2-3 minutes** for build

9. **Done!** Get your URL: `https://durian-farm-xxxx.vercel.app`

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd durian-frontend

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Setup and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - Project name? durian-farm
# - Directory? ./
# - Override settings? N

# Production deploy
vercel --prod
```

---

## 🔧 Step 3: Update Backend CORS

After getting Vercel URL, update backend environment variables:

**Go to Render Dashboard** → durian-backend → **Environment**

Add/Update:
```
SANCTUM_STATEFUL_DOMAINS = durian-farm-xxxx.vercel.app
CORS_ALLOWED_ORIGINS = https://durian-farm-xxxx.vercel.app
SESSION_DOMAIN = .vercel.app
```

Click **"Save Changes"** → Service will auto-redeploy

---

## 🧪 Step 4: Test Integration

### 1. Open Frontend URL:
```
https://durian-farm-xxxx.vercel.app
```

### 2. Test Login:
- Email: `admin@durian.com`
- Password: `password`

### 3. Check Features:
- ✅ Dashboard loads
- ✅ Pokok list works
- ✅ Can create/edit data
- ✅ Busut management accessible
- ✅ Photos upload (if enabled)

---

## 📱 Step 5: Mobile Testing

### Progressive Web App (PWA):

1. **On Mobile Chrome/Safari**:
   - Open: `https://durian-farm-xxxx.vercel.app`
   - Click **"Add to Home Screen"**
   - App icon appears on home screen

2. **Test Offline**:
   - Open app
   - Turn off WiFi/Data
   - App should still load (cached)
   - Changes queue for sync

---

## 🔄 Step 6: Enable Auto-Deploy

**Already enabled!** Every git push to main = auto deploy

```bash
# Make changes to frontend
cd durian-frontend/src

# Commit and push
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys in 2-3 minutes
```

---

## ⚙️ Configuration Files

### `.env.production`
```env
VITE_API_URL=https://durian-backend-b9u2.onrender.com/api
```

### `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

### `package.json` (scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🎯 Custom Domain (Optional)

### Add Your Domain:

1. **Go to**: Project Settings → Domains
2. **Add Domain**: `durianfarm.com`
3. **Update DNS** (at your domain registrar):
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. **Wait 5-10 minutes** for DNS propagation
5. **SSL auto-configured** by Vercel

---

## 🔍 Troubleshooting

### Build Failed

**Error**: `npm install failed`
**Fix**: Check `package.json` dependencies, make sure Node version compatible

---

### API Not Working

**Error**: CORS error in browser console
**Fix**:
1. Check `CORS_ALLOWED_ORIGINS` in backend
2. Make sure includes your Vercel URL
3. Redeploy backend

---

### 404 on Refresh

**Error**: Refreshing page shows 404
**Fix**: Check `vercel.json` has rewrites configured (already done)

---

### Environment Variables Not Working

**Error**: Still pointing to localhost
**Fix**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `VITE_API_URL`
3. Redeploy (trigger new deployment)

---

### Slow First Load

**Cause**: Render free tier backend sleeping
**Fix**:
1. Use UptimeRobot to ping backend every 14 min
2. Or upgrade Render to paid tier ($7/month)

---

## 📊 Vercel Features

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments (for PRs)
- ✅ Zero config
- ✅ Auto-scaling

### Analytics (Optional - Paid):
- Real-time visitor stats
- Core Web Vitals
- Performance insights

---

## 🚀 Deployment Checklist

- [ ] Backend deployed and working
- [ ] `.env.production` updated with backend URL
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Login tested
- [ ] CORS configured in backend
- [ ] Mobile PWA tested
- [ ] Auto-deploy verified

---

## 📞 Quick Commands

### Local Development:
```bash
cd durian-frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Build Locally (test):
```bash
npm run build
npm run preview
# Open http://localhost:4173
```

### Deploy via CLI:
```bash
vercel --prod
```

### Check Deployment:
```bash
vercel ls
vercel inspect <deployment-url>
```

---

## 🎉 Expected Result

**Frontend URL**: `https://durian-farm-xxxx.vercel.app`

**Features Working**:
- ✅ Login/Logout
- ✅ Dashboard with stats
- ✅ Pokok management (CRUD)
- ✅ Busut zones & list
- ✅ Baja, Hasil, Inspeksi, Spray
- ✅ Reports & exports
- ✅ Activity logs
- ✅ User profile
- ✅ PWA (installable)
- ✅ Offline support

---

**Ready to deploy! Follow Step 2 above! 🚀**
