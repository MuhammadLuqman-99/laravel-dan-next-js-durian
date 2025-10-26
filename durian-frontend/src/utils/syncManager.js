import api from './api';
import { getSyncQueue, removeFromSyncQueue, cacheData } from './offlineStorage';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
  }

  // Add listener for sync events
  addSyncListener(callback) {
    this.syncListeners.push(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => listener(event, data));
  }

  // Sync all pending actions
  async syncAll() {
    if (this.isSyncing || !navigator.onLine) {
      console.log('Already syncing or offline, skipping sync');
      return { success: false, message: 'Already syncing or offline' };
    }

    this.isSyncing = true;
    this.notifyListeners('sync_start', {});

    try {
      const queue = await getSyncQueue();
      console.log(`Syncing ${queue.length} pending actions`);

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const action of queue) {
        try {
          await this.syncAction(action);
          await removeFromSyncQueue(action.queueId);
          successCount++;
          this.notifyListeners('sync_action_success', action);
        } catch (error) {
          console.error('Error syncing action:', action, error);
          failCount++;
          errors.push({ action, error: error.message });
          this.notifyListeners('sync_action_error', { action, error });
        }
      }

      this.isSyncing = false;
      const result = {
        success: failCount === 0,
        successCount,
        failCount,
        errors
      };

      this.notifyListeners('sync_complete', result);
      return result;
    } catch (error) {
      this.isSyncing = false;
      console.error('Error during sync:', error);
      this.notifyListeners('sync_error', error);
      return { success: false, error: error.message };
    }
  }

  // Sync individual action
  async syncAction(action) {
    const { entity, type, data } = action;

    switch (type) {
      case 'CREATE':
        return await this.syncCreate(entity, data);
      case 'UPDATE':
        return await this.syncUpdate(entity, data);
      case 'DELETE':
        return await this.syncDelete(entity, data);
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Sync CREATE action
  async syncCreate(entity, data) {
    const endpoint = `/${entity}`;

    // Handle image uploads for inspeksi
    if (entity === 'inspeksi' && data.gambar instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      return await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return await api.post(endpoint, data);
  }

  // Sync UPDATE action
  async syncUpdate(entity, data) {
    const endpoint = `/${entity}/${data.id}`;

    // Handle image uploads for inspeksi
    if (entity === 'inspeksi' && data.gambar instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      formData.append('_method', 'PUT');
      return await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return await api.put(endpoint, data);
  }

  // Sync DELETE action
  async syncDelete(entity, data) {
    const endpoint = `/${entity}/${data.id}`;
    return await api.delete(endpoint);
  }

  // Refresh cached data after sync
  async refreshCache(entity) {
    try {
      const response = await api.get(`/${entity}`);
      await cacheData(`${entity}_list`, response.data.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error refreshing ${entity} cache:`, error);
      return null;
    }
  }
}

// Create singleton instance
const syncManager = new SyncManager();

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('Device is back online, starting auto-sync...');
  setTimeout(() => {
    syncManager.syncAll();
  }, 1000); // Wait 1 second to ensure connection is stable
});

export default syncManager;
