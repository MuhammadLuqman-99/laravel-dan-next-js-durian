# Offline Mode Usage Guide

## Overview
This durian farm management system now supports full offline functionality with automatic sync when back online.

## Features
- ✅ Full CRUD operations offline (Create, Read, Update, Delete)
- ✅ Automatic data caching with IndexedDB
- ✅ Sync queue for offline actions
- ✅ Auto-sync when device comes back online
- ✅ Manual sync button
- ✅ Offline indicator UI
- ✅ Cached weather data for offline viewing

## How to Use in Your Pages

### Option 1: Use offlineApi (Recommended for new pages)

```javascript
import offlineApi from '../utils/offlineApi';

// GET request (auto-caches, falls back to cache when offline)
const fetchData = async () => {
  try {
    const response = await offlineApi.get('/pokok');
    const data = response.data.data;

    // Check if from cache
    if (response.fromCache) {
      console.log('Data loaded from cache (offline)');
    }

    setData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// CREATE request (queues when offline)
const createItem = async (formData) => {
  try {
    const response = await offlineApi.post('/pokok', formData);

    // Check if queued for sync
    if (response.offline) {
      alert('Data saved offline. Will sync when online.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// UPDATE request (queues when offline)
const updateItem = async (id, formData) => {
  try {
    const response = await offlineApi.put(`/pokok/${id}`, formData);

    if (response.offline) {
      alert('Update saved offline. Will sync when online.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// DELETE request (queues when offline)
const deleteItem = async (id) => {
  try {
    const response = await offlineApi.delete(`/pokok/${id}`);

    if (response.offline) {
      alert('Delete queued. Will sync when online.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Option 2: Manual Cache Management

```javascript
import { cacheData, getCachedData, addToSyncQueue, isOnline } from '../utils/offlineStorage';
import api from '../utils/api';

const fetchData = async () => {
  try {
    if (isOnline()) {
      // Fetch from API
      const response = await api.get('/pokok');
      const data = response.data.data;

      // Cache the data
      await cacheData('pokok_list', data);
      setData(data);
    } else {
      // Load from cache
      const cached = await getCachedData('pokok_list');
      if (cached) {
        setData(cached);
        alert('Viewing cached data (offline mode)');
      }
    }
  } catch (error) {
    // Fallback to cache on error
    const cached = await getCachedData('pokok_list');
    if (cached) {
      setData(cached);
    }
  }
};

const createItem = async (formData) => {
  if (!isOnline()) {
    // Queue for sync
    await addToSyncQueue({
      entity: 'pokok',
      type: 'CREATE',
      data: formData
    });

    alert('Data saved offline. Will sync when online.');
  } else {
    // Create immediately
    await api.post('/pokok', formData);
  }
};
```

## Sync Manager

### Manual Sync
```javascript
import syncManager from '../utils/syncManager';

// Trigger manual sync
const handleSync = async () => {
  const result = await syncManager.syncAll();

  if (result.success) {
    alert(`Synced ${result.successCount} items successfully`);
  } else {
    alert(`Sync failed for ${result.failCount} items`);
  }
};
```

### Listen to Sync Events
```javascript
import syncManager from '../utils/syncManager';

useEffect(() => {
  syncManager.addSyncListener((event, data) => {
    if (event === 'sync_complete') {
      console.log('Sync completed:', data);
      // Refresh your data
      fetchData();
    }
  });
}, []);
```

## Offline Indicator Component

The `<OfflineIndicator />` component is already added to the Layout and provides:

- Red banner when offline
- Pending actions counter
- Manual sync button
- Sync status notifications
- Green "Online" badge when connected

## Best Practices

1. **Always cache list data**: Cache all GET requests for lists to enable offline viewing
   ```javascript
   await cacheData('pokok_list', data);
   ```

2. **Check response.offline**: When creating/updating/deleting, check if action was queued
   ```javascript
   if (response.offline) {
     // Show offline message
   }
   ```

3. **Refresh after sync**: Listen to sync events and refresh data
   ```javascript
   syncManager.addSyncListener((event) => {
     if (event === 'sync_complete') {
       fetchData(); // Reload fresh data
     }
   });
   ```

4. **Handle images carefully**: For image uploads (inspeksi), the File object is preserved in queue

5. **Show offline indicators**: Use the `isOnline()` helper to show UI indicators
   ```javascript
   import { isOnline } from '../utils/offlineStorage';

   {!isOnline() && <div>⚠️ Offline Mode</div>}
   ```

## Testing Offline Mode

1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try creating/updating data
4. Check OfflineIndicator shows pending count
5. Go back "Online"
6. Data should auto-sync

## Cache Keys Convention

Use this naming pattern for cache keys:
- Lists: `{entity}_list` (e.g., 'pokok_list', 'baja_list')
- Single items: `{entity}_{id}` (e.g., 'pokok_123')
- Special data: descriptive names (e.g., 'weather_data', 'dashboard_stats')

## Troubleshooting

**Data not syncing?**
- Check Network tab for errors
- Open IndexedDB in DevTools to see queued actions
- Check browser console for sync errors

**Cache not working?**
- IndexedDB might be disabled in browser
- Check storage quota (Settings → Site Settings → Storage)

**Duplicate data after sync?**
- The sync queue prevents duplicates using queueId
- If you see duplicates, clear cache and resync
