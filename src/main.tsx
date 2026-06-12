import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for offline capabilities
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('BLOCKSI PWA: Service Worker registrado con éxito.', reg.scope);
      })
      .catch((err) => {
        console.warn('BLOCKSI PWA: Fallo al registrar el Service Worker:', err);
      });
  });
}
