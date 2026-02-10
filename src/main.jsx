import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { registerSW, unregisterSW, clearCache } from './utils/serviceWorker.js';
import './index.css';

// Lazy load admin setup utilities only in development
// (Removed: adminSetup/superAdminSetup were unused)

// Service worker: disabled by default to avoid stale cache issues in prod
if (import.meta.env.PROD) {
  const enableSW = import.meta.env.VITE_ENABLE_SW === 'true';
  if (enableSW) {
    registerSW().catch(() => {});
  } else {
    clearCache().catch(() => {});
    unregisterSW().catch(() => {});
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </HelmetProvider>
);
