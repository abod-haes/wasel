import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/i18n';

import { App } from '@/app/App';
import {
  cleanupChunkRecoveryUrl,
  recoverFromChunkError,
} from '@/lib/chunk-recovery';

import './index.css';

cleanupChunkRecoveryUrl();

window.addEventListener('vite:preloadError', (event) => {
  if (recoverFromChunkError()) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
