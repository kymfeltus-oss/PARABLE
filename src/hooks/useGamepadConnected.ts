'use client';

import { useEffect, useState } from 'react';

function anyGamepadConnected() {
  const pads = typeof navigator !== 'undefined' ? navigator.getGamepads?.() : null;
  if (!pads) return false;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i]) return true;
  }
  return false;
}

export function useGamepadConnected() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sync = () => setConnected(anyGamepadConnected());
    sync();
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    const id = window.setInterval(sync, 2000);
    return () => {
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      window.clearInterval(id);
    };
  }, []);

  return connected;
}
