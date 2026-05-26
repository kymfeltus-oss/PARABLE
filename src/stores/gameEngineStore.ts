import { create } from 'zustand';

export type ParableEngineBackend = 'unknown' | 'webgpu' | 'webgl2' | 'webgl';

type GameEngineState = {
  backend: ParableEngineBackend;
  setBackend: (b: Exclude<ParableEngineBackend, 'unknown'>) => void;
};

export const useGameEngineStore = create<GameEngineState>((set) => ({
  backend: 'unknown',
  setBackend: (b) => set({ backend: b }),
}));
