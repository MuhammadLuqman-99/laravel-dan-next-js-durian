import api from './api';
import {
  cacheData,
  getCachedData,
  addToSyncQueue,
  applyOfflineAction,
  isOnline
} from './offlineStorage';

// Offline-aware API wrapper
class OfflineApi {
  // GET request with offline fallback
  async get(endpoint, options = {}) {
    const cacheKey = endpoint.replace(/\//g, '_');

    try {
      if (isOnline()) {
        const response = await api.get(endpoint, options);
        // Cache successful response
        await cacheData(cacheKey, response.data.data || response.data);
        return response;
      } else {
        // Return cached data if offline
        const cached = await getCachedData(cacheKey);
        if (cached) {
          return {
            data: { data: cached },
            fromCache: true,
            offline: true
          };
        }
        throw new Error('No cached data available offline');
      }
    } catch (error) {
      // If online request fails, try cache
      if (!isOnline() || error.code === 'ERR_NETWORK') {
        const cached = await getCachedData(cacheKey);
        if (cached) {
          return {
            data: { data: cached },
            fromCache: true,
            offline: true
          };
        }
      }
      throw error;
    }
  }

  // POST request with offline queue
  async post(endpoint, data, options = {}) {
    const entity = endpoint.split('/')[1]; // Extract entity name

    if (isOnline()) {
      try {
        const response = await api.post(endpoint, data, options);
        // Refresh cache after successful create
        await this.refreshCache(entity);
        return response;
      } catch (error) {
        // If request fails due to network, queue it
        if (error.code === 'ERR_NETWORK') {
          return this.queueOfflineAction(entity, 'CREATE', data);
        }
        throw error;
      }
    } else {
      // Offline: queue the action
      return this.queueOfflineAction(entity, 'CREATE', data);
    }
  }

  // PUT request with offline queue
  async put(endpoint, data, options = {}) {
    const entity = endpoint.split('/')[1];

    if (isOnline()) {
      try {
        const response = await api.put(endpoint, data, options);
        await this.refreshCache(entity);
        return response;
      } catch (error) {
        if (error.code === 'ERR_NETWORK') {
          return this.queueOfflineAction(entity, 'UPDATE', data);
        }
        throw error;
      }
    } else {
      return this.queueOfflineAction(entity, 'UPDATE', data);
    }
  }

  // DELETE request with offline queue
  async delete(endpoint, options = {}) {
    const parts = endpoint.split('/');
    const entity = parts[1];
    const id = parts[2];

    if (isOnline()) {
      try {
        const response = await api.delete(endpoint, options);
        await this.refreshCache(entity);
        return response;
      } catch (error) {
        if (error.code === 'ERR_NETWORK') {
          return this.queueOfflineAction(entity, 'DELETE', { id });
        }
        throw error;
      }
    } else {
      return this.queueOfflineAction(entity, 'DELETE', { id });
    }
  }

  // Queue action for later sync
  async queueOfflineAction(entity, type, data) {
    const action = {
      entity,
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to sync queue
    const queuedAction = await addToSyncQueue(action);

    // Apply optimistic update to local cache
    const updatedData = await applyOfflineAction(entity, action, data);

    return {
      data: {
        data: type === 'DELETE' ? { id: data.id } : data,
        message: `${type} queued for sync when online`,
        queued: true
      },
      offline: true,
      queueId: queuedAction?.queueId
    };
  }

  // Refresh cache for an entity
  async refreshCache(entity) {
    if (!isOnline()) return;

    try {
      const response = await api.get(`/${entity}`);
      await cacheData(`${entity}_list`, response.data.data);
    } catch (error) {
      console.error(`Error refreshing cache for ${entity}:`, error);
    }
  }
}

export default new OfflineApi();
