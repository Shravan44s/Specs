import { create } from 'zustand';
import type { Tier } from './tier';

type AppState = {
  sceneReady: boolean;
  introDone: boolean;
  tier: Tier | null;
  sceneVisible: boolean;
  soundOn: boolean;
  setSceneReady: () => void;
  setIntroDone: () => void;
  setTier: (tier: Tier) => void;
  setSceneVisible: (visible: boolean) => void;
  setSoundOn: (on: boolean) => void;
};

export const useApp = create<AppState>((set) => ({
  sceneReady: false,
  introDone: false,
  tier: null,
  sceneVisible: true,
  soundOn: false,
  setSceneReady: () => set({ sceneReady: true }),
  setIntroDone: () => set({ introDone: true }),
  setTier: (tier) => set({ tier }),
  setSceneVisible: (sceneVisible) => set({ sceneVisible }),
  setSoundOn: (soundOn) => set({ soundOn }),
}));
