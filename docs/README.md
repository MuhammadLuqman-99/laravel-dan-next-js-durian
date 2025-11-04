# 📚 Documentation Index

Complete documentation for the Durian Farm Management System.

---

## 🚀 Quick Start

**New to the project?** Start here:

1. [Quick Deploy Guide](deployment/QUICK_DEPLOY.md) - Get the system running in 10 minutes
2. [Busut System Overview](guides/BUSUT_SYSTEM.md) - Understand the busut management system
3. [Troubleshooting](deployment/TROUBLESHOOTING.md) - Common issues and solutions

---

## 📖 Documentation Structure

### 🌐 Deployment Guides

All deployment-related documentation for hosting the system:

| Document | Description | When to Use |
|----------|-------------|-------------|
| [**Quick Deploy**](deployment/QUICK_DEPLOY.md) | 10-minute deployment guide | First time deploying |
| [**Render Setup**](deployment/RENDER.md) | Complete backend deployment on Render.com | Backend hosting |
| [**Vercel Setup**](deployment/VERCEL.md) | Frontend deployment on Vercel | Frontend hosting |
| [**Backup Strategy**](deployment/BACKUP.md) | Database backup methods and schedules | Data protection |
| [**Troubleshooting**](deployment/TROUBLESHOOTING.md) | Common errors and solutions | When things break |

---

### 📘 Feature Guides

Documentation for specific system features:

| Document | Description | Key Topics |
|----------|-------------|------------|
| [**Busut System**](guides/BUSUT_SYSTEM.md) | Complete busut management system | 229 busut, zones, GPS, capacity tracking, maintenance |
| [**Performance**](guides/PERFORMANCE.md) | Optimizations for 1000+ trees | Database indexes, pagination, eager loading |

---

### 🗄️ Archive

Older documentation files kept for reference:

| Document | Description |
|----------|-------------|
| [Deployment Guide (Old)](archive/DEPLOYMENT_GUIDE.md) | Original deployment guide |
| [Index (Old)](archive/INDEX.md) | Original documentation index |
| [Mobile Improvements](archive/MOBILE_IMPROVEMENTS_DONE.md) | Mobile optimization history |
| [Mobile Checklist](archive/MOBILE_OPTIMIZATION_CHECKLIST.md) | Mobile optimization tasks |
| [Ngrok Setup](archive/NGROK_SETUP.md) | Local development tunneling |
| [Render Guide (Old)](archive/RENDER_DEPLOYMENT_GUIDE.md) | Original Render guide |
| [Render ENV (Old)](archive/RENDER_ENV_SETUP.md) | Original ENV setup |
| [Penting (Old)](archive/penting.md) | Old important notes |

---

## 🎯 Recommended Reading Order

### For New Developers:

1. **Main README.md** (project root) - Project overview and tech stack
2. **Quick Deploy Guide** - Get system running locally and in production
3. **Busut System Guide** - Understand the core business logic
4. **Performance Guide** - Learn about optimizations

### For DevOps/Deployment:

1. **Quick Deploy Guide** - Fast deployment overview
2. **Render Setup** - Backend hosting details
3. **Vercel Setup** - Frontend hosting details
4. **Backup Strategy** - Data protection and recovery
5. **Troubleshooting** - Common deployment issues

### For Maintenance/Support:

1. **Troubleshooting** - Start here for error resolution
2. **Backup Strategy** - Data recovery procedures
3. **Performance Guide** - When system is slow

---

## 📊 System Overview

### Architecture:

```
Frontend (Vercel)          Backend (Render)         Database (Render)
┌──────────────────┐      ┌──────────────────┐     ┌──────────────────┐
│  React + Vite    │─────▶│  Laravel 11      │────▶│  PostgreSQL      │
│  Tailwind CSS    │ API  │  PHP 8.2         │     │  1GB Free Tier   │
│  PWA Support     │      │  Docker + Nginx  │     │                  │
└──────────────────┘      └──────────────────┘     └──────────────────┘
```

### Key Features:

- **Pokok Durian Management** - Track 1000+ durian trees
- **Busut System** - Manage 229 land mounds across 2 zones
- **Harvest Tracking** - Record yields, quality, sales
- **Maintenance Logs** - Fertilizer, spray, inspection records
- **GPS Integration** - Map visualization with Leaflet
- **PWA Support** - Installable mobile app with offline support
- **Activity Logging** - Complete audit trail
- **Photo Management** - Upload and organize tree/harvest photos

---

## 🔗 External Resources

### Live URLs:

- **Backend API**: https://durian-backend-b9u2.onrender.com
- **Frontend App**: https://durian-farm-xxxx.vercel.app (replace with your URL)
- **Database**: Render PostgreSQL (Internal URL in ENV)

### Credentials:

```
Admin Login:
Email: admin@durian.com
Password: password

Database:
Host: your-database-host.render.com
Database: durian_farm
User: your-database-user
Password: (see BACKUP.md)
```

---

## 🆘 Getting Help

### Common Issues:

1. **Can't login?** → [Troubleshooting: Authentication Issues](deployment/TROUBLESHOOTING.md#-authentication-issues)
2. **Backend slow?** → [Troubleshooting: Backend Slow](deployment/TROUBLESHOOTING.md#backend-slow)
3. **CORS error?** → [Troubleshooting: CORS Policy](deployment/TROUBLESHOOTING.md#error-cors-policy)
4. **Data lost?** → [Backup: Restore Backup](deployment/BACKUP.md#-restore-backup)
5. **Deploy failed?** → [Troubleshooting: Common Errors](deployment/TROUBLESHOOTING.md#-common-errors)

### Debug Checklist:

- [ ] Check environment variables set correctly
- [ ] Verify database credentials
- [ ] Confirm CORS configured
- [ ] Test backend URL directly (visit API endpoint)
- [ ] Check browser console for errors (F12)
- [ ] Review logs on Render/Vercel dashboard

---

## 📝 Documentation Standards

### When to Update Documentation:

- After adding new features or modules
- When changing deployment configuration
- After fixing critical bugs
- When adding new environment variables
- After database schema changes

### How to Contribute:

1. Keep guides concise and actionable
2. Use clear headings and sections
3. Include code examples where helpful
4. Add troubleshooting tips for common issues
5. Update this index when adding new docs

---

## 🏗️ Project Structure

```
durian/
├── durian-backend/          # Laravel backend
│   ├── app/                 # Models, Controllers, Services
│   ├── database/            # Migrations, Seeders
│   ├── routes/              # API routes
│   └── ...
├── durian-frontend/         # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── ...
│   └── ...
├── docs/                    # Documentation (you are here)
│   ├── deployment/          # Deployment guides
│   ├── guides/              # Feature guides
│   └── archive/             # Old documentation
├── Dockerfile               # Backend Docker configuration
├── render.yaml              # Render deployment config
└── README.md                # Main project README
```

---

## 🔄 Maintenance Schedule

### Weekly:
- [ ] Check backend logs for errors
- [ ] Review activity logs for unusual patterns
- [ ] Test critical user flows

### Monthly:
- [ ] **Backup database** (see [Backup Strategy](deployment/BACKUP.md))
- [ ] Review storage usage (Render dashboard)
- [ ] Update dependencies if needed
- [ ] Clean old activity logs (optional)

### Quarterly:
- [ ] Review performance metrics
- [ ] Optimize database queries if needed
- [ ] Update documentation for any changes
- [ ] Test disaster recovery process

---

## 💡 Tips & Best Practices

### Development:

- Always test locally before deploying
- Use feature branches for new features
- Commit frequently with clear messages
- Keep environment variables in sync

### Deployment:

- Deploy backend first, then frontend
- Verify backend API works before deploying frontend
- Update CORS settings when changing frontend URL
- Keep backup before major changes

### Maintenance:

- Monitor free tier limits (Render sleeps after 15 min)
- Set up UptimeRobot to keep backend awake
- **BACKUP DATABASE MONTHLY** (critical!)
- Review logs regularly for errors

---

**Last Updated**: November 2024

**Maintained By**: Durian Farm Management Team

**Questions?** Check [Troubleshooting](deployment/TROUBLESHOOTING.md) or review the guides above.
