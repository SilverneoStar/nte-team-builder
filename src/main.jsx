// Entry point: mounts the app into #root in index.html and loads the site's styles.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Brushed-metal texture for the element strips (public asset, so set via the base path).
document.documentElement.style.setProperty('--metal-tex', `url(${import.meta.env.BASE_URL}icons/brushed-metal.webp)`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
