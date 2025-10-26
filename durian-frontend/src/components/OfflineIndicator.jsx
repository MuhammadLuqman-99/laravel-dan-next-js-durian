import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import syncManager from '../utils/syncManager';
import { getSyncQueue } from '../utils/offlineStorage';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending count
    const updatePendingCount = async () => {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    // Listen to sync events
    syncManager.addSyncListener((event, data) => {
      if (event === 'sync_start') {
        setIsSyncing(true);
        setSyncStatus(null);
      } else if (event === 'sync_complete') {
        setIsSyncing(false);
        setSyncStatus(data);
        updatePendingCount();
        // Clear status after 5 seconds
        setTimeout(() => setSyncStatus(null), 5000);
      } else if (event === 'sync_error') {
        setIsSyncing(false);
        setSyncStatus({ success: false, error: data });
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    await syncManager.syncAll();
  };

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
          <WifiOff size={20} />
          <span className="font-medium">Mode Offline - Data akan sync bila online semula</span>
        </div>
      )}

      {/* Sync Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Pending Actions Badge */}
        {pendingCount > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
              isOnline
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-600 text-white'
            }`}
          >
            <Clock size={18} />
            <span className="font-medium">{pendingCount} pending</span>
            {isOnline && !isSyncing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualSync();
                }}
                className="ml-2 p-1 hover:bg-yellow-700 rounded"
                title="Sync sekarang"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </button>
        )}

        {/* Syncing Indicator */}
        {isSyncing && (
          <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg">
            <RefreshCw size={18} className="animate-spin" />
            <span className="font-medium">Syncing data...</span>
          </div>
        )}

        {/* Sync Success/Error Message */}
        {syncStatus && (
          <div
            className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
              syncStatus.success
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {syncStatus.success ? (
              <>
                <CheckCircle size={18} />
                <span className="font-medium">
                  Synced {syncStatus.successCount} items
                </span>
              </>
            ) : (
              <>
                <XCircle size={18} />
                <span className="font-medium">Sync failed</span>
              </>
            )}
          </div>
        )}

        {/* Online Indicator (minimal) */}
        {isOnline && pendingCount === 0 && !isSyncing && !syncStatus && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg shadow-lg opacity-75">
            <Wifi size={16} />
            <span className="text-sm">Online</span>
          </div>
        )}
      </div>

      {/* Pending Actions Details Modal */}
      {showDetails && pendingCount > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pending Actions</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                {pendingCount} actions menunggu untuk sync ke server bila online.
              </p>
            </div>

            {isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Sekarang'}
              </button>
            )}

            {!isOnline && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Device offline. Data akan auto-sync bila online semula.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
