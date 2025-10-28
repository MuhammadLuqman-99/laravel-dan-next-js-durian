# PWA Features - Sistem Kebun Durian

## 🎯 Features Implemented

### 1. **Installable as Mobile App**
- Add to home screen on mobile devices
- Standalone app experience (no browser UI)
- App shortcuts for quick access to:
  - Dashboard
  - Pokok (Trees)
  - Inspeksi (Inspections)

### 2. **Offline Support**
- Works without internet connection
- Cached pages and assets
- Offline data storage with localStorage
- Queued actions when offline

### 3. **Auto-Update**
- Automatic service worker updates
- User notification when new version available
- One-click update without losing data

### 4. **Smart Caching Strategy**

#### Network First (Fresh Data)
- API GET requests
- 10 second network timeout
- Falls back to cache if network fails
- 24 hour cache expiration

#### Cache First (Static Assets)
- Images from storage
- QR codes
- Weather data (30 min cache)
- App icons and assets

### 5. **Offline Indicators**
- Online/Offline status badge
- Yellow notification when going offline
- Green indicator when online

### 6. **Install Prompt**
- Appears after 3 seconds on first visit
- Dismissible (won't show again if dismissed)
- Animated slide-up entrance
- Clear call-to-action

## 📱 How to Install

### On Android (Chrome/Edge):
1. Open the app in Chrome
2. Wait for install prompt, or
3. Menu (⋮) → "Install app" or "Add to Home screen"
4. Confirm installation

### On iOS (Safari):
1. Open the app in Safari
2. Tap Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### On Desktop (Chrome/Edge):
1. Look for install icon (⊕) in address bar
2. Click it and confirm
3. Or: Menu → "Install Sistem Kebun Durian"

## 🔧 Development

### Build for Production
```bash
npm run build
```

This will:
- Generate optimized bundle
- Create service worker
- Generate PWA manifest
- Process all caching strategies

### Preview Production Build
```bash
npm run preview
```

### Test PWA Features
1. Build production version
2. Serve with HTTPS (required for PWA)
3. Use Chrome DevTools → Application → Service Workers
4. Test offline mode: DevTools → Network → Offline checkbox

## 🎨 Customization

### Change App Icon
Replace these files in `public/`:
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)

### Change Theme Color
Edit `vite.config.js`:
```javascript
manifest: {
  theme_color: '#16a34a', // Your brand color
  background_color: '#ffffff',
}
```

### Modify Cache Strategy
Edit `vite.config.js` → `workbox.runtimeCaching`:
```javascript
{
  urlPattern: /your-pattern/,
  handler: 'NetworkFirst', // or 'CacheFirst', 'StaleWhileRevalidate'
  options: {
    cacheName: 'your-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400 // 24 hours
    }
  }
}
```

## 📊 Cache Storage

### API Cache
- **Name**: `api-get-cache`
- **Strategy**: Network First
- **Max entries**: 100
- **Duration**: 24 hours

### Image Cache
- **Name**: `image-cache`
- **Strategy**: Cache First
- **Max entries**: 200
- **Duration**: 30 days

### QR Code Cache
- **Name**: `qrcode-cache`
- **Strategy**: Cache First
- **Max entries**: 100
- **Duration**: 7 days

## 🔄 Offline Queue

The app includes an offline action queue that:
1. Stores actions when offline
2. Automatically syncs when back online
3. Maintains action order
4. Shows sync progress

### Using Offline Queue
```javascript
import { useOfflineQueue } from './hooks/useOfflineStorage';

const { addToQueue, processQueue } = useOfflineQueue();

// Add action when offline
if (!navigator.onLine) {
  addToQueue({
    type: 'CREATE_TREE',
    data: treeData
  });
}

// Process queue when online
window.addEventListener('online', async () => {
  await processQueue(async (action) => {
    // Process each action
    await api.post('/api/pokok', action.data);
  });
});
```

## 🐛 Troubleshooting

### Service Worker Not Updating
1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Click "Unregister" and refresh
4. Hard refresh (Ctrl+Shift+R)

### Install Prompt Not Showing
- Must be served over HTTPS (or localhost)
- User hasn't dismissed it before
- App meets PWA criteria
- Check Console for errors

### Offline Mode Not Working
1. Check if service worker is active
2. Verify cache storage in DevTools
3. Test network tab → Offline checkbox
4. Clear cache and re-register SW

### Cache Not Clearing
```javascript
// Force clear all caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

## 📈 Performance Metrics

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- **PWA: 100** ✅

### Caching Impact
- **First Load**: ~500KB
- **Cached Load**: ~50KB (90% reduction)
- **Offline**: Instant (0ms network)

## 🔐 Security

- HTTPS required for service workers
- No sensitive data in cache
- Cache cleared on logout
- Token stored securely (not in SW cache)

## 📝 Notes

- iOS has limited PWA support (no push notifications)
- Android provides full PWA experience
- Desktop PWA support varies by browser
- Service worker updates check every 24 hours
- Offline queue has size limits (check localStorage quota)

## 🚀 Future Enhancements

- [ ] Background sync for offline actions
- [ ] Push notifications (Android only)
- [ ] Periodic background sync
- [ ] Share target API
- [ ] Badge API for unread counts
- [ ] Advanced caching with IndexedDB
