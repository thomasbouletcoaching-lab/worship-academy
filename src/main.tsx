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
