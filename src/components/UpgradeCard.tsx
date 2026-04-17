import type { UpgradeRecommendation, UpgradePriority } from '../types';

interface UpgradeCardProps {
  recommendation: UpgradeRecommendation;
}

const priorityConfig: Record<
  UpgradePriority,
  { badge: string; border: string; icon: string }
> = {
  critical: {
    badge: 'bg-red-900/60 text-red-300 border border-red-700',
    border: 'border-red-700/50',
    icon: '🔴',
  },
  high: {
    badge: 'bg-amber-900/60 text-amber-300 border border-amber-700',
    border: 'border-amber-700/50',
    icon: '🟠',
  },
  medium: {
    badge: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700',
    border: 'border-yellow-700/50',
    icon: '🟡',
  },
  low: {
    badge: 'bg-slate-700/60 text-slate-300 border border-slate-600',
    border: 'border-slate-600/50',
    icon: '🔵',
  },
};

export function UpgradeCard({ recommendation }: UpgradeCardProps) {
  const config = priorityConfig[recommendation.priority];
  const currentName = recommendation.currentItem
    ? (recommendation.currentItem as { name: string }).name
    : 'None';
  const recommendedName = (recommendation.recommendedItem as { name: string }).name;

  return (
    <div className={`rounded-xl border bg-slate-800/60 p-4 space-y-3 ${config.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="font-semibold text-slate-100">{recommendation.component}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
          {recommendation.priority.toUpperCase()}
        </span>
      </div>

      {/* Current → Recommended */}
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded bg-slate-700 px-2 py-1 text-slate-300 line-through max-w-[140px] truncate">
          {currentName}
        </span>
        <span className="text-slate-500">→</span>
        <span className="rounded bg-violet-900/50 px-2 py-1 text-violet-200 max-w-[140px] truncate">
          {recommendedName}
        </span>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-400 leading-relaxed">{recommendation.reason}</p>

      {/* Stats */}
      <div className="flex gap-3">
        {recommendation.estimatedImprovement > 0 && (
          <div className="flex flex-col items-center rounded-lg bg-emerald-900/20 border border-emerald-800/50 px-3 py-1.5">
            <span className="text-xs text-slate-400">Performance</span>
            <span className="text-sm font-bold text-emerald-400">
              +{recommendation.estimatedImprovement} pts
            </span>
          </div>
        )}
        <div className="flex flex-col items-center rounded-lg bg-slate-700/50 border border-slate-600/50 px-3 py-1.5">
          <span className="text-xs text-slate-400">Cost</span>
          <span
            className={`text-sm font-bold ${
              recommendation.priceDelta > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {recommendation.priceDelta >= 0 ? '+' : ''}${recommendation.priceDelta}
          </span>
        </div>
      </div>
    </div>
  );
}
