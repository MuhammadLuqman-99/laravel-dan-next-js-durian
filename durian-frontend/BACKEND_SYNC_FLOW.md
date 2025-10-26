# Backend Sync Flow - How Offline Data Reaches Database

## Complete Data Flow Diagram

```
┌─────────────────┐
│  Farmer Offline │
│   di Kebun      │
└────────┬────────┘
         │
         │ 1. Create/Update/Delete action
         ▼
┌─────────────────────────┐
│   offlineApi.js         │
│   Queue action locally  │
└────────┬────────────────┘
         │
         │ 2. Store in IndexedDB
         ▼
┌─────────────────────────┐
│   IndexedDB Storage     │
│   - sync_queue table    │
│   - cached data         │
└────────┬────────────────┘
         │
         │ 3. Wait for online...
         │
         │ 4. Device back online
         ▼
┌─────────────────────────┐
│   syncManager.js        │
│   Auto-sync triggered   │
└────────┬────────────────┘
         │
         │ 5. Process queue
         ▼
┌─────────────────────────┐
│   For each action:      │
│   - CREATE → POST       │
│   - UPDATE → PUT        │
│   - DELETE → DELETE     │
└────────┬────────────────┘
         │
         │ 6. HTTP Request
         ▼
┌─────────────────────────┐
│   Laravel Backend       │
│   API Endpoints         │
└────────┬────────────────┘
         │
         │ 7. Controller processes
         ▼
┌─────────────────────────┐
│   SprayController.php   │
│   BajaController.php    │
│   etc.                  │
└────────┬────────────────┘
         │
         │ 8. Eloquent ORM
         ▼
┌─────────────────────────┐
│   MySQL Database        │
│   durian_farm           │
│   - spray table         │
│   - baja table          │
│   - hasil table         │
│   - inspeksi table      │
└─────────────────────────┘
```

## Step-by-Step Sync Process

### Step 1: Offline Action Occurs

**Example: Farmer adds spray record offline**

```javascript
// In Spray.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  // This calls offlineApi.post()
  const response = await offlineApi.post('/spray', formData);

  if (response.offline) {
    // Action queued in IndexedDB
    alert('✓ Data saved offline. Will sync when online.');
  }
};
```

### Step 2: Action Stored in Queue

**offlineApi.js creates queue entry:**

```javascript
const action = {
  entity: 'spray',
  type: 'CREATE',
  data: {
    tree_id: 5,
    tarikh_spray: '2025-10-26',
    jenis: 'racun',
    nama_bahan: 'Pesticide A',
    dosage: '100ml/10L',
    interval_hari: 14,
    pekerja: 'Ahmad',
    catatan: 'First spray'
  },
  timestamp: '2025-10-26T10:30:00.000Z'
};

// Stored in IndexedDB with unique queueId
await addToSyncQueue(action);
```

### Step 3: Device Comes Online

**Auto-sync triggers:**

```javascript
// In syncManager.js
window.addEventListener('online', () => {
  console.log('Device is back online, starting auto-sync...');
  setTimeout(() => {
    syncManager.syncAll(); // Wait 1 second for stable connection
  }, 1000);
});
```

### Step 4: Sync Manager Processes Queue

**syncManager.js loops through all pending actions:**

```javascript
async syncAll() {
  const queue = await getSyncQueue(); // Get all pending actions

  for (const action of queue) {
    await this.syncAction(action);      // Send to backend
    await removeFromSyncQueue(action.queueId); // Remove from queue
  }
}
```

### Step 5: HTTP Request to Backend

**For CREATE action:**

```javascript
// syncManager.js → syncCreate()
async syncCreate(entity, data) {
  const endpoint = `/${entity}`; // '/spray'

  // Regular POST request to backend
  return await api.post(endpoint, data);

  // Actual HTTP request:
  // POST http://localhost:8000/api/spray
  // Headers: { Authorization: 'Bearer {token}' }
  // Body: { tree_id: 5, tarikh_spray: '2025-10-26', ... }
}
```

**For UPDATE action:**

```javascript
async syncUpdate(entity, data) {
  const endpoint = `/${entity}/${data.id}`; // '/spray/123'

  return await api.put(endpoint, data);

  // PUT http://localhost:8000/api/spray/123
}
```

**For DELETE action:**

```javascript
async syncDelete(entity, data) {
  const endpoint = `/${entity}/${data.id}`;

  return await api.delete(endpoint);

  // DELETE http://localhost:8000/api/spray/123
}
```

### Step 6: Laravel Backend Receives Request

**Backend route (routes/api.php):**

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('spray', SprayController::class);
    // This creates:
    // POST   /api/spray        → store()
    // PUT    /api/spray/{id}   → update()
    // DELETE /api/spray/{id}   → destroy()
});
```

### Step 7: Controller Processes Data

**SprayController.php - store() method:**

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'tree_id' => 'required|exists:pokok_durian,id',
        'tarikh_spray' => 'required|date',
        'jenis' => 'required|in:racun,foliar,pesticide,fungicide,lain-lain',
        'nama_bahan' => 'required|string',
        'dosage' => 'nullable|string',
        'interval_hari' => 'required|integer',
        'pekerja' => 'required|string',
        'catatan' => 'nullable|string',
    ]);

    $spray = Spray::create($validated);

    return response()->json([
        'success' => true,
        'data' => $spray->load('tree'),
        'message' => 'Spray record created successfully'
    ], 201);
}
```

### Step 8: Data Inserted into MySQL

**Eloquent ORM executes SQL:**

```sql
INSERT INTO spray (
    tree_id,
    tarikh_spray,
    jenis,
    nama_bahan,
    dosage,
    interval_hari,
    pekerja,
    catatan,
    created_at,
    updated_at
) VALUES (
    5,
    '2025-10-26',
    'racun',
    'Pesticide A',
    '100ml/10L',
    14,
    'Ahmad',
    'First spray',
    '2025-10-26 10:35:00',
    '2025-10-26 10:35:00'
);
```

**MySQL durian_farm database now has the record!**

### Step 9: Success Response & Cache Update

**Backend responds:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "tree_id": 5,
    "tarikh_spray": "2025-10-26",
    "jenis": "racun",
    "nama_bahan": "Pesticide A",
    "tree": {
      "id": 5,
      "tag_no": "D005",
      "varieti": "Musang King"
    }
  },
  "message": "Spray record created successfully"
}
```

**syncManager.js:**
1. Removes action from sync queue ✅
2. Refreshes local cache with server data ✅
3. Notifies UI: "Synced 1 item" ✅

## Special Cases

### Image Upload (Inspeksi with Photo)

**Offline:**
```javascript
// Store File object in IndexedDB
const action = {
  entity: 'inspeksi',
  type: 'CREATE',
  data: {
    tree_id: 5,
    gambar: File // Actual File object preserved
  }
};
```

**Online Sync:**
```javascript
// syncManager converts to FormData
const formData = new FormData();
formData.append('tree_id', 5);
formData.append('gambar', File); // File object

await api.post('/inspeksi', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Backend:**
```php
public function store(Request $request)
{
    if ($request->hasFile('gambar')) {
        $path = $request->file('gambar')->store('inspeksi', 'public');
        $validated['gambar'] = $path;
    }

    Inspeksi::create($validated);
}
```

**File saved:** `storage/app/public/inspeksi/xyz123.jpg`

## Error Handling

### What if sync fails?

**Network error:**
```javascript
try {
  await this.syncAction(action);
  // Success - remove from queue
  await removeFromSyncQueue(action.queueId);
} catch (error) {
  // Error - keep in queue for retry
  console.error('Sync failed, will retry later');
  errors.push({ action, error });
}
```

**Validation error from backend:**
```javascript
// Backend returns 422 Unprocessable Entity
{
  "message": "Validation failed",
  "errors": {
    "tree_id": ["Tree not found"]
  }
}

// Action stays in queue
// User sees error in sync status
// Can manually fix and retry
```

## Monitoring Sync Status

### Frontend sees:

1. **Pending count badge:** "3 pending"
2. **Syncing indicator:** "Syncing data..." (spinner)
3. **Success message:** "Synced 3 items"
4. **Error message:** "Sync failed for 1 item"

### Backend logs (Laravel):

```
[2025-10-26 10:35:00] local.INFO: Spray created {"id": 123}
[2025-10-26 10:35:05] local.INFO: Baja updated {"id": 45}
[2025-10-26 10:35:10] local.INFO: Hasil created {"id": 67}
```

## Database Verification

### Check if data reached MySQL:

```sql
-- Check latest spray records
SELECT * FROM spray ORDER BY created_at DESC LIMIT 10;

-- Check if specific tree has new spray
SELECT s.*, p.tag_no
FROM spray s
JOIN pokok_durian p ON s.tree_id = p.id
WHERE p.tag_no = 'D005'
ORDER BY s.tarikh_spray DESC;

-- Count records created today
SELECT COUNT(*) FROM spray
WHERE DATE(created_at) = CURDATE();
```

## Testing the Flow

### Manual Test:

1. **Go offline** (DevTools → Network → Offline)
2. **Add spray record** → See "Data saved offline"
3. **Check IndexedDB:**
   - Open DevTools → Application → IndexedDB
   - durian-farm-sync → sync_queue → pending_actions
   - Should see 1 object with your data

4. **Go online** (Network → No throttling)
5. **Watch console:** "Device is back online, starting auto-sync..."
6. **Check database:**
   ```php
   php artisan tinker
   >>> Spray::latest()->first()
   ```

7. **Should see your record with server-generated ID!**

## Summary

**The backend doesn't need ANY special handling for offline sync!**

✅ Backend receives normal HTTP requests (POST/PUT/DELETE)
✅ Controllers process like any other request
✅ MySQL stores data normally
✅ Laravel Sanctum handles authentication
✅ Validation works as expected

**The magic happens entirely in the frontend:**
- IndexedDB stores actions offline
- syncManager sends them when online
- Backend just sees regular API requests!

This is why your existing SprayController, BajaController, etc. work perfectly with offline sync - no backend changes needed! 🎉
