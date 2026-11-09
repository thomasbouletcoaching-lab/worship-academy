import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Thème : préférence mémorisée (si le stockage est disponible), sinon celui du système.
try {
  const saved = localStorage.getItem('wa-theme');
  const dark = saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', !!dark);
} catch {
  /* stockage indisponible : on garde le thème clair par défaut */
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Hors ligne : le service worker met toute l'app en cache après la première visite (production uniquement).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne indisponible : l'app fonctionne quand même */ });
  });
}
