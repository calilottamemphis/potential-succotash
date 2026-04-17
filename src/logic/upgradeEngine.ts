import type {
  BuildConfig,
  UsageScenario,
  UpgradeRecommendation,
  UpgradePriority,
  CPU,
  GPU,
  RAM,
  Storage,
  BottleneckItem,
} from '../types';
import componentsData from '../data/components.json';
import { detectBottlenecks, checkPowerRequirement } from './bottleneckDetection';

type ComponentList = typeof componentsData;

function priorityFromSeverity(severity: BottleneckItem['severity']): UpgradePriority {
  switch (severity) {
    case 'severe': return 'critical';
    case 'moderate': return 'high';
    case 'mild': return 'medium';
    default: return 'low';
  }
}

/** Find the best CPU one tier above the current one for the same socket */
function suggestCpuUpgrade(current: CPU | null): CPU | null {
  const all = componentsData.cpus as CPU[];
  if (!current) return all[1] ?? null; // default suggestion

  const candidates = all.filter(
    (c) => c.socket === current.socket && c.tier > current.tier
  );
  if (candidates.length === 0) return null;
  // Prefer the lowest tier above current (incremental upgrade)
  candidates.sort((a, b) => a.tier - b.tier);
  return candidates[0];
}

/** Find the best GPU one tier above the current one */
function suggestGpuUpgrade(current: GPU | null): GPU | null {
  const all = componentsData.gpus as GPU[];
  if (!current) return all[1] ?? null;

  const candidates = all.filter((g) => g.tier > current.tier);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.tier - b.tier);
  return candidates[0];
}

/** Suggest next RAM tier (prefer same type if possible) */
function suggestRamUpgrade(current: RAM | null): RAM | null {
  const all = componentsData.rams as RAM[];
  if (!current) return all[1] ?? null;

  const sameType = all.filter((r) => r.type === current.type && r.tier > current.tier);
  if (sameType.length > 0) {
    sameType.sort((a, b) => a.tier - b.tier);
    return sameType[0];
  }
  const anyHigher = all.filter((r) => r.tier > current.tier);
  if (anyHigher.length === 0) return null;
  anyHigher.sort((a, b) => a.tier - b.tier);
  return anyHigher[0];
}

/** Suggest next storage tier */
function suggestStorageUpgrade(current: Storage | null): Storage | null {
  const all = componentsData.storages as Storage[];
  if (!current) return all[1] ?? null;

  const candidates = all.filter((s) => s.tier > current.tier);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.tier - b.tier);
  return candidates[0];
}

export function generateUpgradeRecommendations(
  build: BuildConfig,
  usage: UsageScenario
): UpgradeRecommendation[] {
  const { bottlenecks } = detectBottlenecks(build, usage);
  const powerCheck = checkPowerRequirement(build);
  const recommendations: UpgradeRecommendation[] = [];

  for (const bottleneck of bottlenecks) {
    if (bottleneck.severity === 'none') continue;

    const priority = priorityFromSeverity(bottleneck.severity);

    switch (bottleneck.component) {
      case 'cpu': {
        const suggested = suggestCpuUpgrade(build.cpu);
        if (suggested) {
          recommendations.push({
            component: 'CPU',
            currentItem: build.cpu,
            recommendedItem: suggested,
            priority,
            reason: bottleneck.message,
            estimatedImprovement: suggested.score - (build.cpu?.score ?? 0),
            priceDelta: suggested.price - (build.cpu?.price ?? 0),
          });
        }
        break;
      }
      case 'gpu': {
        const suggested = suggestGpuUpgrade(build.gpu);
        if (suggested) {
          recommendations.push({
            component: 'GPU',
            currentItem: build.gpu,
            recommendedItem: suggested,
            priority,
            reason: bottleneck.message,
            estimatedImprovement: suggested.score - (build.gpu?.score ?? 0),
            priceDelta: suggested.price - (build.gpu?.price ?? 0),
          });
        }
        break;
      }
      case 'ram': {
        const suggested = suggestRamUpgrade(build.ram);
        if (suggested) {
          recommendations.push({
            component: 'RAM',
            currentItem: build.ram,
            recommendedItem: suggested,
            priority,
            reason: bottleneck.message,
            estimatedImprovement: suggested.score - (build.ram?.score ?? 0),
            priceDelta: suggested.price - (build.ram?.price ?? 0),
          });
        }
        break;
      }
      case 'storage': {
        const suggested = suggestStorageUpgrade(build.storage);
        if (suggested) {
          recommendations.push({
            component: 'Storage',
            currentItem: build.storage,
            recommendedItem: suggested,
            priority,
            reason: bottleneck.message,
            estimatedImprovement: suggested.score - (build.storage?.score ?? 0),
            priceDelta: suggested.price - (build.storage?.price ?? 0),
          });
        }
        break;
      }
    }
  }

  // Power supply check
  if (!powerCheck.sufficient) {
    const adequatePsu = (componentsData.psus).find(
      (p) => p.wattage >= powerCheck.recommended
    );
    if (adequatePsu) {
      recommendations.push({
        component: 'PSU',
        currentItem: build.psu,
        recommendedItem: adequatePsu,
        priority: 'critical',
        reason: `Your current PSU (${build.psu?.wattage ?? 0}W) is insufficient for your CPU+GPU combination. Minimum recommended: ${powerCheck.recommended}W.`,
        estimatedImprovement: 0,
        priceDelta: adequatePsu.price - (build.psu?.price ?? 0),
      });
    }
  }

  // Sort: critical first, then high, medium, low
  const order: Record<UpgradePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => order[a.priority] - order[b.priority]);

  return recommendations;
}

export { componentsData as ComponentsList };
export type { ComponentList };
