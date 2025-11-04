# 🌾 Durian Farm Management System

> Complete farm management system dengan busut tracking, pokok monitoring, dan comprehensive reporting.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://durian-backend-b9u2.onrender.com)
[![Backend](https://img.shields.io/badge/backend-Laravel-red)](https://laravel.com)
[![Frontend](https://img.shields.io/badge/frontend-React-blue)](https://react.dev)
[![Database](https://img.shields.io/badge/database-PostgreSQL-blue)](https://postgresql.org)

---

## 🚀 Quick Start

### Live URLs
- **Backend API**: https://durian-backend-b9u2.onrender.com/api
- **Frontend App**: https://durian-farm-xxxx.vercel.app *(update with your URL)*

### Default Login
```
Email: admin@durian.com
Password: password
```

---

## 📋 Features

### 🌳 **Pokok Management**
- Track 1000+ durian trees
- QR code labels
- GPS coordinates
- Health monitoring
- Harvest records

### 🏔️ **Busut System**
- 229 busut tanah (179 Atas + 50 Bawah)
- GPS mapping
- Capacity tracking (15-25 trees per busut)
- Soil testing records
- Maintenance logs

### 📊 **Operations**
- Baja (fertilizer) tracking
- Spray/pesticide logs
- Inspeksi kesihatan
- Hasil (harvest) records

### 💰 **Financial**
- Sales tracking
- Expense management
- Profit/loss reports
- Monthly/yearly analytics

### 👥 **User Management**
- Admin (full access)
- Pekerja (view only)
- Activity logging
- Security monitoring

### 📱 **PWA Features**
- Install as mobile app
- Offline support
- Background sync
- Push notifications (optional)

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 11
- **Database**: PostgreSQL
- **Auth**: Laravel Sanctum
- **Storage**: Render.com
- **Features**: RESTful API, migrations, seeders

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **UI**: Tailwind CSS
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts, Chart.js
- **PWA**: Workbox
- **Storage**: LocalForage
- **Hosting**: Vercel

---

## 📁 Project Structure

```
durian/
├── durian-backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
├── durian-frontend/         # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── public/
│
├── docs/                    # Documentation
│   ├── deployment/          # Deployment guides
│   ├── guides/              # User guides
│   └── archive/             # Old docs
│
├── Dockerfile               # Backend Docker config
├── render.yaml              # Render deployment
└── README.md               # This file
```

---

## 📖 Documentation

### For Deployment
- 🚀 **[Quick Deploy Guide](docs/deployment/QUICK_DEPLOY.md)** - Deploy in 10 minutes
- 🔧 **[Render Setup](docs/deployment/RENDER.md)** - Backend deployment
- ⚡ **[Vercel Setup](docs/deployment/VERCEL.md)** - Frontend deployment
- 🔒 **[Backup Strategy](docs/deployment/BACKUP.md)** - Database backups

### For Development
- 🌳 **[Busut System](docs/guides/BUSUT_SYSTEM.md)** - How busut management works
- 🎨 **[Performance](docs/guides/PERFORMANCE.md)** - Optimization tips

### For Troubleshooting
- ❌ **[Common Issues](docs/deployment/TROUBLESHOOTING.md)** - Fix common errors

---

## 🚀 Local Development

### Backend Setup

```bash
cd durian-backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start server
php artisan serve
# API available at http://localhost:8000
```

### Frontend Setup

```bash
cd durian-frontend

# Install dependencies
npm install

# Setup environment
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm run dev
# App available at http://localhost:5173
```

---

## 🌐 Deployment

### Prerequisites
- GitHub account
- Render.com account (free)
- Vercel account (free)

### Deploy Backend (5 minutes)
1. Create PostgreSQL database on Render
2. Create Web Service pointing to this repo
3. Add environment variables
4. Deploy!

📖 **[Full Backend Guide](docs/deployment/RENDER.md)**

### Deploy Frontend (3 minutes)
1. Import project to Vercel
2. Set root directory: `durian-frontend`
3. Add `VITE_API_URL` environment variable
4. Deploy!

📖 **[Full Frontend Guide](docs/deployment/VERCEL.md)**

---

## 💾 Database Schema

### Core Tables
- `users` - Admin & pekerja accounts
- `zones` - Farm zones (Atas/Bawah)
- `busut` - 229 busut records
- `pokok_durian` - Durian trees
- `baja` - Fertilizer logs
- `hasil` - Harvest records
- `inspeksi` - Health inspections
- `spray` - Pesticide applications
- `busut_maintenance` - Busut maintenance logs
- `expenses` - Farm expenses
- `sales` - Sales records
- `activity_logs` - Audit trail

---

## 🔐 Security Features

- ✅ Authentication via Laravel Sanctum
- ✅ Role-based access control (admin/pekerja)
- ✅ Activity logging
- ✅ Security event monitoring
- ✅ IP blocking capability
- ✅ Session management
- ✅ CORS protection
- ✅ XSS protection

---

## 📊 Key Statistics

- **229 Busut** across 2 zones
- **3000+ Pokok** capacity
- **15-25 Trees** per busut
- **Complete audit trail** of all operations
- **Offline support** for mobile workers
- **RESTful API** with 50+ endpoints

---

## 🤝 Contributing

This is a private project, but suggestions welcome!

---

## 📝 License

Private project - All rights reserved

---

## 👨‍💻 Developer

Created with ❤️ for Malaysian durian farmers

**Backend**: Laravel 11 + PostgreSQL
**Frontend**: React 18 + Vite + Tailwind
**Deployment**: Render + Vercel (Free tier)

---

## 🆘 Support

Need help?
1. Check **[Troubleshooting Guide](docs/deployment/TROUBLESHOOTING.md)**
2. Review **[Documentation Index](docs/README.md)**
3. Check deployment logs on Render/Vercel

---

## 📞 Quick Links

- [Backend API Docs](https://durian-backend-b9u2.onrender.com/api)
- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentation Index](docs/README.md)

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
