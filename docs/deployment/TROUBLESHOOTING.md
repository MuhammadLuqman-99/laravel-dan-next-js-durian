# 🔧 Troubleshooting Guide

Common issues dan solutions.

---

## 🚨 Backend Issues

### Error: "No APP_KEY"
**Symptom**: RuntimeException: No application encryption key

**Fix**:
1. Go to Render → Environment
2. Add: `APP_KEY=base64:[YOUR_APP_KEY]`
3. Save → Redeploy

---

### Error: "Connection Refused"
**Symptom**: SQLSTATE[08006] connection failed

**Fix**:
1. Check DB_HOST uses **Internal URL** (dpg-xxx-**a**)
2. NOT External URL
3. Verify DB credentials correct
4. Redeploy backend

---

### Error: "Migration Failed"
**Symptom**: Base table or view not found

**Fix**:
- Already auto-fixed in startup script
- If persists, check database exists
- Verify DB credentials

---

### Backend Slow
**Cause**: Free tier sleeps after 15 min

**Fix**:
1. Use UptimeRobot (free): https://uptimerobot.com
2. Ping every 14 minutes
3. OR upgrade to paid ($7/month)

---

## 🎨 Frontend Issues

### Error: "CORS Policy"
**Symptom**: blocked by CORS policy in browser console

**Fix**:
1. Render → durian-backend → Environment
2. Add/Update:
   ```
   CORS_ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
   ```
3. Save (auto-redeploy)
4. Hard refresh browser (Ctrl+F5)

---

### Error: "404 on Refresh"
**Symptom**: Page shows 404 when refresh

**Fix**:
- Already fixed in `vercel.json`
- If persists, check vercel.json has rewrites
- Redeploy

---

### Build Failed on Vercel
**Symptom**: npm install failed

**Fix**:
- Already fixed with `.npmrc`
- If persists, check package.json
- Verify Node version compatible

---

### API Not Loading
**Symptom**: Blank page, loading forever

**Fix**:
1. Check `VITE_API_URL` in Vercel
2. Verify backend is running (visit backend URL)
3. Check browser console for errors
4. Verify CORS configured

---

## 💾 Database Issues

### Data Lost
**Symptom**: All data disappeared

**Cause**: Render deletes inactive databases after 90 days

**Fix**:
1. Restore from backup (see BACKUP.md)
2. Setup regular backups NOW
3. Set calendar reminder

**Prevention**:
- Monthly backup minimum
- Store in Google Drive
- Test restore process

---

### Database Full
**Symptom**: Cannot insert new records

**Cause**: Free tier 1GB limit reached

**Fix**:
1. Clean old logs:
   ```sql
   DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '30 days';
   ```
2. Archive old data
3. OR upgrade to paid plan

---

## 🔐 Authentication Issues

### Can't Login
**Symptom**: Invalid credentials

**Fix**:
1. Use default: `admin@durian.com` / `password`
2. Check backend logs
3. Verify database seeded
4. Try register new account

---

### Session Expired
**Symptom**: Keep getting logged out

**Fix**:
1. Check SESSION_DRIVER=database
2. Verify cache table exists
3. Clear browser cookies
4. Login again

---

## 📱 Mobile Issues

### PWA Won't Install
**Symptom**: "Add to Home Screen" not showing

**Fix**:
1. Must use HTTPS (Vercel has this)
2. Check manifest.json exists
3. Use Chrome/Safari
4. Try desktop first

---

### Offline Not Working
**Symptom**: App doesn't work offline

**Fix**:
1. First visit online to cache
2. Check service worker registered
3. Clear cache and retry
4. Check browser console

---

## 🐛 Common Errors

### 500 Internal Server Error
**Check**:
1. Backend logs in Render
2. Database connection
3. Environment variables
4. Recent code changes

**Fix**:
- Usually env variable missing
- Check .env vs Render environment
- Rollback if recent deploy broke it

---

### 502 Bad Gateway
**Check**:
1. Backend container running
2. Port 8080 exposed
3. Nginx configuration

**Fix**:
- Usually startup script issue
- Check Render logs
- Verify Dockerfile correct

---

### Slow Performance
**Causes**:
- Free tier backend sleeping
- Large database queries
- No caching
- Too many API calls

**Fix**:
1. Implement caching
2. Optimize queries
3. Use pagination
4. Add loading states

---

## 🆘 Getting Help

### Check Logs First

**Render**:
1. Dashboard → durian-backend
2. Logs tab
3. Look for red errors
4. Search for "ERROR" or "FAIL"

**Vercel**:
1. Dashboard → Project
2. Deployments → Click latest
3. Build Logs / Function Logs
4. Browser console (F12)

### Debug Checklist

- [ ] All environment variables set?
- [ ] Database credentials correct?
- [ ] CORS configured?
- [ ] Backend running? (visit URL)
- [ ] Recent code changes?
- [ ] Logs checked?

---

## 📞 Quick Fixes

### Nuclear Option (Reset Everything)

**If everything broken**:

1. **Backup database first!**
2. Delete Render services
3. Delete Vercel project
4. Redeploy from scratch (10 min)
5. Restore database backup

---

**Still stuck?** Check:
- [Render Docs](RENDER.md)
- [Vercel Docs](VERCEL.md)
- [GitHub Issues](https://github.com/your-repo/issues)
