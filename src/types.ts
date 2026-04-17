export interface CPU {
  id: string;
  name: string;
  brand: string;
  socket: string;
  cores: number;
  threads: number;
  baseClock: number;
  boostClock: number;
  tdp: number;
  tier: number;
  score: number;
  price: number;
}

export interface GPU {
  id: string;
  name: string;
  brand: string;
  vram: number;
  tier: number;
  score: number;
  tdp: number;
  price: number;
}

export interface RAM {
  id: string;
  name: string;
  capacity: number;
  type: string;
  speed: number;
  tier: number;
  score: number;
  price: number;
}

export interface Storage {
  id: string;
  name: string;
  capacity: number;
  type: string;
  readSpeed: number;
  tier: number;
  score: number;
  price: number;
}

export interface PSU {
  id: string;
  name: string;
  wattage: number;
  rating: string;
  tier: number;
  score: number;
  price: number;
}

export interface Motherboard {
  id: string;
  name: string;
  socket: string;
  formFactor: string;
  supportedRam: string[];
  tier: number;
  score: number;
  price: number;
}

export type UsageScenario = 'gaming' | 'workstation' | 'streaming' | 'video_editing' | 'general';

export interface BuildConfig {
  cpu: CPU | null;
  gpu: GPU | null;
  ram: RAM | null;
  storage: Storage | null;
  psu: PSU | null;
  motherboard: Motherboard | null;
}

export interface ComponentScores {
  cpu: number;
  gpu: number;
  ram: number;
  storage: number;
}

export interface BottleneckResult {
  scores: ComponentScores;
  weightedScores: ComponentScores;
  bottlenecks: BottleneckItem[];
  overallBalance: number;
}

export interface BottleneckItem {
  component: keyof ComponentScores;
  severity: 'severe' | 'moderate' | 'mild' | 'none';
  scoreDelta: number;
  message: string;
}

export type UpgradePriority = 'critical' | 'high' | 'medium' | 'low';

export interface UpgradeRecommendation {
  component: string;
  currentItem: CPU | GPU | RAM | Storage | PSU | Motherboard | null;
  recommendedItem: CPU | GPU | RAM | Storage | PSU | Motherboard;
  priority: UpgradePriority;
  reason: string;
  estimatedImprovement: number;
  priceDelta: number;
}
