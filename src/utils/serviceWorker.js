export const registerSW = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.toast?.success('New version available! Please refresh the page.');
            }
          });
        }
      });
      
      return registration;
    } catch { /* ignore */ }
  }
};

export const unregisterSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) await registration.unregister();
    } catch { /* ignore */ }
  }
};

export const clearCache = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => resolve(e.data.success);
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
    });
  }
};

export const updateSW = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};