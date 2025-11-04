# 🏔️ Busut Management System

Complete system untuk manage busut tanah (land mounds) dalam kebun durian

---

## 📊 Overview

Kebun ini ada **229 busut tanah**:
- **Area Atas**: 179 busut (`ATAS-001` to `ATAS-179`)
- **Area Bawah**: 50 busut (`BAWAH-001` to `BAWAH-050`)

Each busut boleh contain **15-25 pokok durian** (depending on dimensions)

---

## ✅ Backend Implementation (DONE)

### **1. Database Structure**

#### **Zones Table**
```sql
- id
- name (e.g., "Area Atas")
- code (e.g., "ATAS")
- description
- total_busut (179 or 50)
- total_area_hectares
- color_code (for map visualization)
```

#### **Busut Table**
```sql
- id
- zone_id (link to zones)
- busut_code (e.g., "ATAS-001")
- busut_number (1-179 or 1-50)
- panjang (length in meters)
- lebar (width in meters)
- tinggi (height in meters)
- latitude
- longitude
- soil_type
- soil_ph
- last_soil_test
- capacity_trees (max trees)
- current_trees (current count)
- status (baik/perlu_repair/perlu_naik_tanah/baru_buat)
- date_created
- last_maintenance
- notes
```

#### **Busut Maintenance Table**
```sql
- id
- busut_id
- user_id
- maintenance_type (soil_test/naik_tanah/repair_erosion/fertilization/drainage_check/other)
- tarikh
- findings
- actions_taken
- cost
- ph_level, nitrogen, phosphorus, potassium (for soil test)
- recommendations
```

#### **Pokok Durian Update**
```sql
Added fields:
- busut_id (link to busut)
- position_in_busut (e.g., "Baris 1, Pokok 3")
```

---

### **2. API Endpoints**

#### **Zones Management**
```
GET    /api/zones                      - List all zones dengan statistics
GET    /api/zones/{id}                 - Zone details dengan busut list
POST   /api/zones                      - Create new zone
PUT    /api/zones/{id}                 - Update zone
DELETE /api/zones/{id}                 - Delete zone
GET    /api/zones/{id}/statistics      - Zone statistics
```

#### **Busut Management**
```
GET    /api/busut                      - List busut (paginated, filterable)
GET    /api/busut/{id}                 - Busut details dengan pokok & maintenance
POST   /api/busut                      - Create new busut
PUT    /api/busut/{id}                 - Update busut
DELETE /api/busut/{id}                 - Delete busut (if no trees)
GET    /api/busut-statistics           - Overall busut statistics
GET    /api/busut-map-data             - GPS data untuk map visualization
POST   /api/busut/{id}/assign-pokok    - Assign pokok to busut
```

#### **Busut Maintenance**
```
GET    /api/busut-maintenance                 - List maintenance records
GET    /api/busut-maintenance/{id}            - Maintenance details
POST   /api/busut-maintenance                 - Create maintenance record
PUT    /api/busut-maintenance/{id}            - Update maintenance record
DELETE /api/busut-maintenance/{id}            - Delete maintenance record
GET    /api/busut-maintenance-statistics      - Maintenance statistics
```

---

### **3. Features Implemented**

#### **Smart Tracking:**
✅ Auto-calculate utilization % (how full is the busut)
✅ Check if busut is full or has space
✅ Auto-update tree count when assigning
✅ Grid layout GPS coordinates
✅ Color coding by zone

#### **Maintenance Tracking:**
✅ Soil testing (pH, NPK levels)
✅ Naik tanah (add soil) records
✅ Erosion repair logs
✅ Fertilization history
✅ Drainage checks
✅ Cost tracking

#### **Statistics & Analytics:**
✅ Total busut per zone
✅ Busut by status (baik/perlu_repair/etc.)
✅ Utilization rates
✅ Capacity vs current trees
✅ Maintenance costs
✅ Soil health trends

---

## 🚀 Running Migrations & Seeders

### **Step 1: Run Migrations**
```bash
cd durian-backend
php artisan migrate
```

This will create:
- `zones` table
- `busut` table
- `busut_maintenance` table
- Update `pokok_durian` table

### **Step 2: Seed Data**
```bash
php artisan db:seed --class=BusutSeeder
```

This will create:
- 2 zones (Area Atas, Area Bawah)
- 229 busut total (179 + 50)
- GPS coordinates in grid layout
- Random soil types and pH levels
- Varied statuses

---

## 📱 Frontend UI (Next Steps)

### **Pages to Create:**

#### **1. Zones Overview** (`/zones`)
- List zones with cards
- Show total busut per zone
- Statistics (trees, utilization, status breakdown)
- Color-coded areas

#### **2. Busut List** (`/busut`)
- Paginated table/cards
- Filter by zone, status
- Search by busut code
- Sort by utilization, capacity, etc.
- Bulk actions

#### **3. Busut Details** (`/busut/{id}`)
- Busut information card
- Dimensions, GPS coordinates
- Soil information
- List of pokok on this busut
- Maintenance history
- Add/remove pokok
- Log maintenance

#### **4. Busut Map View** (`/busut/map`)
- Leaflet map with busut markers
- Color-coded by status/utilization
- Click marker to see details
- Filter by zone
- Legend

#### **5. Maintenance Log** (`/busut/maintenance`)
- List all maintenance activities
- Filter by busut, type, date range
- Create new maintenance record
- View costs

#### **6. Assign Pokok to Busut**
- Select multiple pokok
- Choose busut destination
- Check capacity
- Assign position in busut

---

## 🎨 UI Components Needed

### **BusutCard Component**
```jsx
<BusutCard
  busut={busutData}
  onView={() => ...}
  onEdit={() => ...}
/>
```

### **ZoneCard Component**
```jsx
<ZoneCard
  zone={zoneData}
  stats={zoneStats}
  onViewBusut={() => ...}
/>
```

### **BusutStatusBadge**
```jsx
<BusutStatusBadge status="baik" />
<BusutStatusBadge status="perlu_repair" />
```

### **UtilizationBar**
```jsx
<UtilizationBar
  current={20}
  capacity={25}
  percentage={80}
/>
```

### **BusutMap Component**
```jsx
<BusutMap
  busutData={busutList}
  onMarkerClick={(busut) => ...}
/>
```

---

## 📊 Example API Responses

### **GET /api/zones**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Area Atas",
      "code": "ATAS",
      "total_busut": 179,
      "total_pokok": 3580,
      "statistics": {
        "total_busut": 179,
        "total_pokok": 3580,
        "busut_status": {
          "baik": 150,
          "perlu_repair": 20,
          "perlu_naik_tanah": 9
        }
      }
    }
  ]
}
```

### **GET /api/busut/{id}**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "busut_code": "ATAS-001",
    "zone": {
      "name": "Area Atas",
      "code": "ATAS"
    },
    "panjang": 45.00,
    "lebar": 6.00,
    "tinggi": 0.60,
    "latitude": 3.13900000,
    "longitude": 101.68690000,
    "soil_type": "Tanah Liat Berpasir",
    "soil_ph": 6.20,
    "capacity_trees": 20,
    "current_trees": 18,
    "status": "baik",
    "is_full": false,
    "available_space": 2,
    "utilization_percentage": 90.00,
    "pokok": [...],
    "maintenanceRecords": [...]
  }
}
```

---

## 🔧 Next Actions

### **Immediate:**
- [ ] Run migrations
- [ ] Run seeder to create 229 busut
- [ ] Test API endpoints with Postman/curl

### **Frontend:**
- [ ] Create Zones overview page
- [ ] Create Busut list page with filters
- [ ] Create Busut details page
- [ ] Add busut map visualization
- [ ] Maintenance logging UI
- [ ] Assign pokok to busut UI

### **Future Enhancements:**
- [ ] Busut photo gallery
- [ ] Soil test reminders
- [ ] Maintenance scheduling
- [ ] Cost analysis by busut
- [ ] Busut health scoring
- [ ] Mobile-optimized views
- [ ] Busut comparison tool
- [ ] Export busut data to PDF/Excel

---

## 💡 Usage Examples

### **Scenario 1: Create New Busut**
```bash
POST /api/busut
{
  "zone_id": 1,
  "busut_number": 180,
  "panjang": 40,
  "lebar": 5,
  "tinggi": 0.5,
  "latitude": 3.1391,
  "longitude": 101.6870,
  "soil_type": "Tanah Merah",
  "capacity_trees": 18,
  "status": "baru_buat",
  "notes": "Baru siap pada Oktober 2024"
}
```

### **Scenario 2: Assign 10 Pokok to Busut**
```bash
POST /api/busut/1/assign-pokok
{
  "pokok_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

### **Scenario 3: Log Soil Test**
```bash
POST /api/busut-maintenance
{
  "busut_id": 1,
  "maintenance_type": "soil_test",
  "tarikh": "2024-10-29",
  "ph_level": 6.5,
  "nitrogen": 120,
  "phosphorus": 45,
  "potassium": 180,
  "findings": "Soil pH slightly acidic, nutrient levels good",
  "recommendations": "Add lime to increase pH to 6.5-7.0",
  "cost": 150.00
}
```

---

**Generated with Claude Code** 🤖

Ready for Frontend UI implementation! 🚀
