import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdatePrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-slide-down max-w-md">
      <RefreshCw size={20} className="flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">
          Versi baru tersedia!
        </p>
        <p className="text-xs opacity-90">
          Klik untuk kemaskini aplikasi
        </p>
      </div>
      <button
        onClick={handleUpdate}
        className="bg-white text-primary-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        Kemaskini
      </button>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 opacity-75 hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default PWAUpdatePrompt;
