import localforage from 'localforage';

// Configure IndexedDB for offline storage
const offlineDB = localforage.createInstance({
  name: 'durian-farm-offline',
  storeName: 'offline_data',
  description: 'Offline data storage for Durian Farm Management'
});

const syncQueue = localforage.createInstance({
  name: 'durian-farm-sync',
  storeName: 'sync_queue',
  description: 'Queue for syncing offline actions'
});

// Store data for offline access
export const cacheData = async (key, data) => {
  try {
    await offlineDB.setItem(key, {
      data,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error caching data:', error);
    return false;
  }
};

// Retrieve cached data
export const getCachedData = async (key) => {
  try {
    const cached = await offlineDB.getItem(key);
    return cached?.data || null;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

// Add action to sync queue (for CREATE, UPDATE, DELETE operations)
export const addToSyncQueue = async (action) => {
  try {
    const queue = await syncQueue.getItem('pending_actions') || [];
    const actionWithId = {
      ...action,
      queueId: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    queue.push(actionWithId);
    await syncQueue.setItem('pending_actions', queue);
    return actionWithId;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    return null;
  }
};

// Get pending sync actions
export const getSyncQueue = async () => {
  try {
    return await syncQueue.getItem('pending_actions') || [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

// Remove action from sync queue after successful sync
export const removeFromSyncQueue = async (queueId) => {
  try {
    const queue = await syncQueue.getItem('pending_actions') || [];
    const updated = queue.filter(item => item.queueId !== queueId);
    await syncQueue.setItem('pending_actions', updated);
    return true;
  } catch (error) {
    console.error('Error removing from sync queue:', error);
    return false;
  }
};

// Clear all sync queue
export const clearSyncQueue = async () => {
  try {
    await syncQueue.setItem('pending_actions', []);
    return true;
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    return false;
  }
};

// Apply offline action locally (optimistic update)
export const applyOfflineAction = async (entity, action, data) => {
  try {
    const cacheKey = `${entity}_list`;
    const cachedData = await getCachedData(cacheKey) || [];

    let updatedData = [...cachedData];

    switch (action.type) {
      case 'CREATE':
        // Add temporary ID for offline created items
        const tempId = `temp_${Date.now()}`;
        updatedData.push({ ...data, id: tempId, _offline: true });
        break;

      case 'UPDATE':
        updatedData = updatedData.map(item =>
          item.id === data.id ? { ...item, ...data, _offline: true } : item
        );
        break;

      case 'DELETE':
        updatedData = updatedData.filter(item => item.id !== data.id);
        break;

      default:
        break;
    }

    await cacheData(cacheKey, updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error applying offline action:', error);
    return null;
  }
};

// Check if device is online
export const isOnline = () => {
  return navigator.onLine;
};

// Cache weather data for offline access
export const cacheWeatherData = async (weatherData) => {
  return await cacheData('weather_data', weatherData);
};

// Get cached weather data
export const getCachedWeather = async () => {
  return await getCachedData('weather_data');
};

export default {
  cacheData,
  getCachedData,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  applyOfflineAction,
  isOnline,
  cacheWeatherData,
  getCachedWeather
};
