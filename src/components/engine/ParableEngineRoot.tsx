'use client';

import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import type { GLProps, RootState } from '@react-three/fiber';
import { createParableRenderer } from '@/components/engine/createParableRenderer';
import ParableEngineScene from '@/components/engine/ParableEngineScene';
import { useGameEngineStore } from '@/stores/gameEngineStore';

function detectBackend(gl: RootState['gl']): void {
  const anyGl = gl as unknown as { isWebGPURenderer?: boolean };
  if (anyGl.isWebGPURenderer) {
    useGameEngineStore.getState().setBackend('webgpu');
    return;
  }
  const cap = (gl as unknown as { capabilities?: { isWebGL2?: boolean } }).capabilities;
  useGameEngineStore.getState().setBackend(cap?.isWebGL2 ? 'webgl2' : 'webgl');
}

export default function ParableEngineRoot() {
  const onCreated = useCallback((state: RootState) => {
    detectBackend(state.gl);
  }, []);

  return (
    <div className="relative w-full aspect-video max-h-[min(72vh,560px)] rounded-xl border border-[#00f2ff]/25 overflow-hidden bg-black">
      <Canvas
        gl={createParableRenderer as GLProps}
        shadows
        dpr={[1, 2]}
        onCreated={onCreated}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <ParableEngineScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
