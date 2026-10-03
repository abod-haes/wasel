import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/i18n';

import { App } from '@/app/App';
import {
  cleanupChunkRecoveryUrl,
  recoverFromChunkError,
} from '@/lib/chunk-recovery';
import { useAuthStore } from '@/store/use-auth-store';

import './index.css';

cleanupChunkRecoveryUrl();

window.addEventListener('vite:preloadError', (event) => {
  if (recoverFromChunkError()) {
    event.preventDefault();
  }
});

window.addEventListener('wasel:auth-invalidated', () => {
  useAuthStore.getState().logout();
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
