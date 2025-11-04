# 🔒 Database Backup Strategy

## ⚠️ WARNING: Render Free Tier

**Render akan DELETE database selepas 90 hari inactive!**

---

## 🛡️ Solution: Regular Backups

### Option 1: Manual Backup (Recommended)

**Every Month, export database:**

1. **Go to Render Dashboard**
2. **Click your PostgreSQL database**
3. **Settings** → **Backups**
4. **Click "Backup Now"**
5. **Download backup file** (.sql)
6. **Save to Google Drive/Dropbox**

**Set Calendar Reminder**: Backup 1st of every month

---

### Option 2: Automated Backup Script

Create a cron job to backup weekly:

```bash
# backup-db.sh
#!/bin/bash

# Database credentials
DB_HOST="dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com"
DB_NAME="durian_farm"
DB_USER="durian_farm_user"
DB_PASS="F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr"

# Backup filename with date
BACKUP_FILE="durian_farm_backup_$(date +%Y%m%d_%H%M%S).sql"

# Export database
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Upload to Google Drive (using gdrive CLI)
gdrive upload $BACKUP_FILE

# Delete local copy
rm $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
```

**Run weekly** via:
- GitHub Actions
- Your local computer (cron job)
- Another free service (Render Cron Jobs)

---

### Option 3: Export via Laravel Command

Add artisan command untuk backup:

```php
// app/Console/Commands/BackupDatabase.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup';
    protected $description = 'Backup database to storage';

    public function handle()
    {
        $filename = 'backup_' . date('Y-m-d_His') . '.sql';

        $command = sprintf(
            'PGPASSWORD=%s pg_dump -h %s -U %s -d %s > %s',
            config('database.connections.pgsql.password'),
            config('database.connections.pgsql.host'),
            config('database.connections.pgsql.username'),
            config('database.connections.pgsql.database'),
            storage_path('backups/' . $filename)
        );

        exec($command);

        $this->info('Database backed up: ' . $filename);
    }
}
```

Run via Render Shell:
```bash
php artisan db:backup
```

---

## 💾 Where to Store Backups?

### Free Options:

1. **Google Drive** (15GB free)
   - Upload manual setiap bulan
   - Keep 3 latest backups

2. **Dropbox** (2GB free)
   - Auto-sync folder
   - Keep recent backups

3. **GitHub Private Repo**
   - Create private repo: `durian-farm-backups`
   - Push backup files (if < 100MB)
   - Encrypted recommended

4. **OneDrive** (5GB free)
   - Microsoft account
   - Auto-sync

---

## 🔄 Restore Backup

Kalau database kena delete, restore macam ni:

1. **Create new PostgreSQL** on Render
2. **Get new credentials**
3. **Import backup**:
   ```bash
   PGPASSWORD=new_password psql -h new_host -U new_user -d new_database < backup.sql
   ```
4. **Update environment variables** in Render
5. **Redeploy backend**

---

## 📅 Backup Schedule Recommendation

### Minimum (Low Risk):
- **Monthly backup** - 1st of month
- Keep last 3 backups

### Recommended (Medium Risk):
- **Weekly backup** - Every Sunday
- Keep last 4 backups

### Professional (High Priority):
- **Daily backup** - Every night 2am
- Keep last 7 days + monthly archives

---

## 💰 Paid Alternatives (If Business Grows)

### When to Upgrade?

Upgrade bila:
- More than 100 users
- Critical business data
- Need 99.9% uptime
- Database > 500MB

### Paid Options:

**Render Paid**:
```
Starter: $7/month
- No sleep
- Always-on database
- Auto-backups daily
- 24/7 support
```

**Railway**:
```
Hobby: $5/month
- 5GB storage
- No sleep
- Better performance
```

**DigitalOcean Managed PostgreSQL**:
```
Basic: $15/month
- 1GB RAM, 10GB storage
- Auto-backups (daily)
- High availability
- Full control
```

**AWS RDS Free Tier**:
```
Free 12 months:
- 20GB storage
- After 12 months: ~$15/month
```

---

## ⚡ Quick Backup Now (Manual)

### Via pgAdmin (GUI):
1. Download pgAdmin: https://www.pgadmin.org/
2. Add new server:
   ```
   Host: dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com
   Port: 5432
   Database: durian_farm
   Username: durian_farm_user
   Password: F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr
   ```
3. Right-click database → **Backup**
4. Save file

### Via Command Line:
```bash
PGPASSWORD=F6BEyoBIRoJofL1TZaLTH0UoYX4AJzdr pg_dump \
  -h dpg-d3uptqbe5dus739s3430-a.singapore-postgres.render.com \
  -U durian_farm_user \
  -d durian_farm \
  -F c \
  -f durian_farm_backup.dump
```

---

## 📊 Data Size Estimation

**Current setup bole hold**:

```
Free Tier: 1GB storage

Estimation per record:
- User: ~1KB
- Pokok: ~2KB
- Hasil: ~1KB
- Photo metadata: ~500B
- Activity log: ~1KB

1GB can store approximately:
- 50,000 pokok records
- 500,000 activity logs
- 100,000 hasil records

Photos (actual images): Store separately in cloud storage
```

---

## 🎯 Action Plan (Now)

**TODAY**:
- [ ] Manual backup sekarang (test)
- [ ] Save to Google Drive
- [ ] Set calendar reminder (monthly)

**THIS WEEK**:
- [ ] Setup automated backup script
- [ ] Test restore process

**MONTHLY**:
- [ ] Backup on 1st of month
- [ ] Verify backup file not corrupted
- [ ] Delete oldest backup (keep last 3)

---

## 🚨 Critical Warning

**JANGAN lupa backup!**

Story from other developers:
- User A: Lost 6 months data (no backup)
- User B: Render deleted after 90 days inactive
- User C: Spent 3 days manually re-entering data

**15 minutes backup = Save hours of pain!**

---

**Setup backup sekarang! 💾**
