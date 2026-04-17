import type { BottleneckResult } from '../types';

interface BottleneckVisualizerProps {
  result: BottleneckResult;
}

const componentLabels: Record<string, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'Storage',
};

const severityColors: Record<string, { bar: string; text: string; badge: string }> = {
  severe: { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-900/50 text-red-300 border-red-700' },
  moderate: { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-900/50 text-amber-300 border-amber-700' },
  mild: { bar: 'bg-yellow-500', text: 'text-yellow-400', badge: 'bg-yellow-900/50 text-yellow-300 border-yellow-700' },
  none: { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700' },
};

export function BottleneckVisualizer({ result }: BottleneckVisualizerProps) {
  const balanceColor =
    result.overallBalance >= 80
      ? 'text-emerald-400'
      : result.overallBalance >= 60
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Bottleneck Analysis</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Balance Score</span>
          <span className={`text-2xl font-bold ${balanceColor}`}>{result.overallBalance}</span>
          <span className="text-sm text-slate-500">/100</span>
        </div>
      </div>

      {/* Circular/radial visual */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {result.bottlenecks.map((b) => {
          const rawScore = result.scores[b.component];
          const colors = severityColors[b.severity];
          return (
            <div key={b.component} className="flex flex-col items-center gap-2">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${rawScore} 100`}
                    strokeLinecap="round"
                    className={colors.bar.replace('bg-', 'stroke-')}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-200">
                  {rawScore}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-300">
                {componentLabels[b.component] ?? b.component}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colors.badge}`}
              >
                {b.severity === 'none' ? 'Balanced' : b.severity.charAt(0).toUpperCase() + b.severity.slice(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {result.bottlenecks
          .filter((b) => b.severity !== 'none')
          .map((b) => {
            const colors = severityColors[b.severity];
            return (
              <div
                key={b.component}
                className="flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3"
              >
                <span className={`mt-0.5 text-lg ${colors.text}`}>⚠</span>
                <p className="text-sm text-slate-300">{b.message}</p>
              </div>
            );
          })}
        {result.bottlenecks.every((b) => b.severity === 'none') && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-900/20 p-3">
            <span className="text-lg text-emerald-400">✓</span>
            <p className="text-sm text-emerald-300">
              Your build is well-balanced! All components are performing at similar levels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
