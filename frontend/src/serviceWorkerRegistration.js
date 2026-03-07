import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  // registerSW returns a function which when called will update the service worker
  const updateSW = registerSW({
    onNeedRefresh() {},
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}
