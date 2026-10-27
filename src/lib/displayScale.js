// The site-wide display size setting.
import { useEffect, useState } from 'react';

// Display size: scales the whole app, like browser zoom but saved per browser
// and set automatically on large screens.
const KEY = 'nte-team-builder:scale';
export const SCALE_OPTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: '0.9', label: '90%' },
  { id: '1', label: '100%' },
  { id: '1.1', label: '110%' },
  { id: '1.25', label: '125%' },
  { id: '1.4', label: '140%' },
];

// Auto: bigger screens get a little more scale so text isn't tiny.
function autoScale() {
  const w = window.innerWidth;
  if (w >= 2400) return 1.4;
  if (w >= 1800) return 1.25;
  if (w >= 1500) return 1.1;
  return 1;
}

function readSetting() {
  try {
    return localStorage.getItem(KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

export function useDisplayScale() {
  const [setting, setSetting] = useState(readSetting);
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scale = setting === 'auto' ? autoScale() : Number(setting) || 1;

  useEffect(() => {
    const root = document.documentElement;
    root.style.zoom = scale === 1 ? '' : String(scale);
    root.style.setProperty('--zoom', String(scale));
    try {
      localStorage.setItem(KEY, setting);
    } catch {
      /* storage unavailable */
    }
  }, [scale, setting, width]);

  return { setting, setSetting, scale };
}
