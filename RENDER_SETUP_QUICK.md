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
APP_KEY = base64:eorA23r9mmfKGsqDN4xDCWJ7nywyrp/ExaGK+KBAnYE=
APP_ENV = production
APP_DEBUG = false

DB_CONNECTION = pgsql
DB_HOST = dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
DB_PORT = 5432
DB_DATABASE = durian_farm
DB_USERNAME = durian_farm_user
DB_PASSWORD = F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr
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
