import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { registerSW } from './utils/serviceWorker.js';
import './index.css';

// Lazy load admin setup utilities only in development
if (import.meta.env.DEV) {
  import('./features/admin/services/adminSetup.js').catch(() => {});
  import('./features/admin/services/superAdminSetup.js')
    .then(m => m.checkSuperAdminInitialization().catch(() => {}))
    .catch(() => {});
}

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW().catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);