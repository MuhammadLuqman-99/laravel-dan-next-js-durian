import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const threshold = 80; // Distance to trigger refresh

  const handleTouchStart = (e) => {
    // Only trigger if scrolled to top
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY !== 0 || isRefreshing) return;

    const touch = e.touches[0];
    const distance = touch.clientY - touchStart;

    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    setTouchStart(0);
  };

  const pullProgress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull Indicator */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          height: `${Math.min(pullDistance, 80)}px`,
          background: 'linear-gradient(to bottom, rgba(22, 163, 74, 0.1), transparent)',
        }}
      >
        <div className="bg-white rounded-full p-3 shadow-lg">
          <RefreshCw
            size={24}
            className={`text-primary-600 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isPulling && !isRefreshing ? `rotate(${pullProgress * 3.6}deg)` : '',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isPulling && !isRefreshing ? `translateY(${pullDistance * 0.5}px)` : '',
          transition: isPulling ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
