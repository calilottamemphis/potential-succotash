import { create } from 'zustand';
import type { BuildConfig, UsageScenario } from '../types';

interface BuildStore extends BuildConfig {
  usage: UsageScenario;
  setBuildField: <K extends keyof BuildConfig>(field: K, value: BuildConfig[K]) => void;
  setUsage: (usage: UsageScenario) => void;
  resetBuild: () => void;
}

const defaultBuild: BuildConfig & { usage: UsageScenario } = {
  cpu: null,
  gpu: null,
  ram: null,
  storage: null,
  psu: null,
  motherboard: null,
  usage: 'gaming',
};

export const useBuildStore = create<BuildStore>((set) => ({
  ...defaultBuild,
  setBuildField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setUsage: (usage) => set({ usage }),
  resetBuild: () => set(defaultBuild),
}));
