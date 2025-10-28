import { useState, useEffect } from 'react';

/**
 * Hook for managing offline data storage
 * Automatically syncs with server when online
 */
export const useOfflineStorage = (key, initialValue = null) => {
  const [data, setData] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, data]);

  const updateData = (newData) => {
    setData(newData);
  };

  const clearData = () => {
    localStorage.removeItem(key);
    setData(initialValue);
  };

  return {
    data,
    updateData,
    clearData,
    isOnline,
  };
};

/**
 * Queue offline actions to be synced when online
 */
export const useOfflineQueue = () => {
  const QUEUE_KEY = 'offline-action-queue';

  const getQueue = () => {
    try {
      const queue = localStorage.getItem(QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  };

  const addToQueue = (action) => {
    try {
      const queue = getQueue();
      queue.push({
        ...action,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      return false;
    }
  };

  const processQueue = async (processFunction) => {
    const queue = getQueue();
    const processed = [];
    const failed = [];

    for (const action of queue) {
      try {
        await processFunction(action);
        processed.push(action.id);
      } catch (error) {
        console.error('Error processing queued action:', error);
        failed.push(action.id);
      }
    }

    // Remove successfully processed items
    if (processed.length > 0) {
      const remainingQueue = queue.filter(
        (action) => !processed.includes(action.id)
      );
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    }

    return {
      processed: processed.length,
      failed: failed.length,
      remaining: queue.length - processed.length,
    };
  };

  const clearQueue = () => {
    localStorage.removeItem(QUEUE_KEY);
  };

  const getQueueCount = () => {
    return getQueue().length;
  };

  return {
    addToQueue,
    processQueue,
    clearQueue,
    getQueueCount,
    getQueue,
  };
};

/**
 * Cache API responses for offline access
 */
export const useCachedData = (cacheKey, fetchFunction, options = {}) => {
  const { cacheTime = 3600000, staleTime = 60000 } = options; // Default 1 hour cache, 1 min stale
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          // Use cached data
          setData(cachedData);
          setLoading(false);

          // Check if stale
          if (age > staleTime) {
            setIsStale(true);
          }

          // If too old, fetch fresh data
          if (age > cacheTime) {
            throw new Error('Cache expired');
          } else {
            return;
          }
        }

        // Fetch fresh data
        if (navigator.onLine) {
          const freshData = await fetchFunction();
          setData(freshData);
          setError(null);

          // Update cache
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: freshData,
              timestamp: Date.now(),
            })
          );
        } else if (!cached) {
          throw new Error('No cached data and offline');
        }
      } catch (err) {
        setError(err.message);
        if (!data) {
          setData(null);
        }
      } finally {
        setLoading(false);
        setIsStale(false);
      }
    };

    fetchData();
  }, [cacheKey, fetchFunction, cacheTime, staleTime]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const freshData = await fetchFunction();
      setData(freshData);
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: freshData,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
  };
};

export default useOfflineStorage;
