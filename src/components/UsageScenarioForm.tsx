import type { UsageScenario } from '../types';

interface UsageScenarioFormProps {
  usage: UsageScenario;
  budget: number;
  onChange: (usage: UsageScenario) => void;
  onBudgetChange: (budget: number) => void;
}

const scenarios: { value: UsageScenario; label: string; description: string; icon: string }[] = [
  { value: 'gaming', label: 'Gaming', description: 'High-refresh gaming at 1080p–4K', icon: '🎮' },
  { value: 'workstation', label: 'Workstation', description: 'CAD, 3D rendering, data science', icon: '💻' },
  { value: 'streaming', label: 'Streaming', description: 'Live streaming + gaming simultaneously', icon: '📡' },
  { value: 'video_editing', label: 'Video Editing', description: 'Video/photo editing & compositing', icon: '🎬' },
  { value: 'general', label: 'General Use', description: 'Everyday tasks, browsing, office work', icon: '🖥️' },
];

export function UsageScenarioForm({ usage, budget, onChange, onBudgetChange }: UsageScenarioFormProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-5">
      <h2 className="text-lg font-semibold text-slate-100">Usage Scenario</h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => (
          <label
            key={s.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
              usage === s.value
                ? 'border-violet-500 bg-violet-900/30 text-violet-200'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            <input
              type="radio"
              name="usage"
              value={s.value}
              checked={usage === s.value}
              onChange={() => onChange(s.value)}
              className="mt-0.5 accent-violet-500"
            />
            <div>
              <div className="text-sm font-medium">
                <span className="mr-1">{s.icon}</span>
                {s.label}
              </div>
              <div className="text-xs text-slate-400">{s.description}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Upgrade Budget</label>
          <span className="rounded-full bg-violet-900/50 px-3 py-0.5 text-sm font-semibold text-violet-300">
            ${budget.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={3000}
          step={50}
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>$100</span>
          <span>$3,000</span>
        </div>
      </div>
    </div>
  );
}
