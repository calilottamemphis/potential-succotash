import type { BuildConfig, UsageScenario, BottleneckResult, ComponentScores, BottleneckItem } from '../types';
import compatibilityRules from '../data/compatibilityRules.json';

const USAGE_WEIGHTS = compatibilityRules.usageWeights as Record<
  UsageScenario,
  ComponentScores
>;

const BOTTLENECK_THRESHOLDS = compatibilityRules.bottleneckThresholds;

/**
 * Normalises a raw component score (0-100) against a baseline so all
 * components sit on the same 0-100 scale before comparison.
 */
function normaliseScore(score: number | undefined): number {
  return Math.min(100, Math.max(0, score ?? 0));
}

/**
 * Computes per-component bottleneck severity given the weighted scores and
 * the average weighted score across the build.
 */
function classifySeverity(delta: number): BottleneckItem['severity'] {
  const abs = Math.abs(delta);
  if (abs >= BOTTLENECK_THRESHOLDS.severe) return 'severe';
  if (abs >= BOTTLENECK_THRESHOLDS.moderate) return 'moderate';
  if (abs >= BOTTLENECK_THRESHOLDS.mild) return 'mild';
  return 'none';
}

function buildBottleneckMessage(
  component: keyof ComponentScores,
  severity: BottleneckItem['severity'],
  delta: number
): string {
  if (severity === 'none') return `Your ${component.toUpperCase()} is well-balanced with the rest of your build.`;

  const direction = delta < 0 ? 'underperforming' : 'overperforming';
  const labels: Record<BottleneckItem['severity'], string> = {
    severe: 'significantly',
    moderate: 'noticeably',
    mild: 'slightly',
    none: '',
  };

  return `Your ${component.toUpperCase()} is ${labels[severity]} ${direction} relative to your other components (Δ${Math.round(Math.abs(delta))} pts).`;
}

export function detectBottlenecks(
  build: BuildConfig,
  usage: UsageScenario
): BottleneckResult {
  const weights = USAGE_WEIGHTS[usage] ?? USAGE_WEIGHTS.general;

  const rawScores: ComponentScores = {
    cpu: normaliseScore(build.cpu?.score),
    gpu: normaliseScore(build.gpu?.score),
    ram: normaliseScore(build.ram?.score),
    storage: normaliseScore(build.storage?.score),
  };

  // Apply usage-specific weights so the importance of each component varies
  const weightedScores: ComponentScores = {
    cpu: rawScores.cpu * weights.cpu,
    gpu: rawScores.gpu * weights.gpu,
    ram: rawScores.ram * weights.ram,
    storage: rawScores.storage * weights.storage,
  };

  const avgWeighted =
    (weightedScores.cpu + weightedScores.gpu + weightedScores.ram + weightedScores.storage) / 4;

  const bottlenecks: BottleneckItem[] = (
    Object.keys(rawScores) as Array<keyof ComponentScores>
  ).map((component) => {
    const scoreDelta = weightedScores[component] - avgWeighted;
    const severity = classifySeverity(scoreDelta);
    return {
      component,
      severity,
      scoreDelta,
      message: buildBottleneckMessage(component, severity, scoreDelta),
    };
  });

  // Overall balance: 100 minus average deviation from the mean
  const avgDeviation =
    bottlenecks.reduce((sum, b) => sum + Math.abs(b.scoreDelta), 0) / bottlenecks.length;
  const overallBalance = Math.max(0, Math.round(100 - avgDeviation * 2));

  return { scores: rawScores, weightedScores, bottlenecks, overallBalance };
}

/** Checks whether the total TDP of CPU + GPU is within PSU capacity */
export function checkPowerRequirement(build: BuildConfig): {
  sufficient: boolean;
  totalTdp: number;
  recommended: number;
} {
  const cpuTdp = build.cpu?.tdp ?? 0;
  const gpuTdp = build.gpu?.tdp ?? 0;
  const totalTdp = cpuTdp + gpuTdp + 100; // +100W for rest of system
  const recommended = totalTdp + compatibilityRules.psuRequirements.minimumHeadroom;
  const sufficient = (build.psu?.wattage ?? 0) >= recommended;
  return { sufficient, totalTdp, recommended };
}
