import { useEffect, useCallback } from 'react';
import { measureAsync } from './usePerformanceMonitor';

const ENABLE_PERF_LOGS = false;
const preloadedComponents = new Set();

export const usePreloadComponents = () => {
  const preloadComponent = useCallback(async (importPath, componentName, delay = 0) => {
    if (preloadedComponents.has(componentName)) return;
    await new Promise(resolve => setTimeout(resolve, delay));
    try {
      await measureAsync(`Preload ${componentName}`, () => import(/* @vite-ignore */ importPath));
      preloadedComponents.add(componentName);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) return;

    preloadComponent('../features/chat/pages/ChatPage.jsx', 'Chat', 500);
    preloadComponent('../features/auth/pages/AuthPage.jsx', 'Auth', 700);

    setTimeout(() => {
      preloadComponent('../features/settings/pages/SettingsPage.jsx', 'Settings', 0);
      preloadComponent('../features/membership/pages/MembershipPage.jsx', 'Membership', 200);
    }, 2000);

    setTimeout(() => {
      preloadComponent('../pages/AboutPage', 'About', 0);
      preloadComponent('../pages/ContactPage', 'Contact', 200);
    }, 5000);
  }, [preloadComponent]);
};

export const preloadComponent = async (componentPath, componentName) => {
  if (preloadedComponents.has(componentName)) return;
  try {
    await measureAsync(`Manual preload ${componentName}`, () => import(/* @vite-ignore */ componentPath));
    preloadedComponents.add(componentName);
  } catch { /* silent */ }
};
