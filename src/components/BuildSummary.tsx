import type { BuildConfig } from '../types';

interface BuildSummaryProps {
  build: BuildConfig;
  totalPrice: number;
}

type SpecItem = {
  label: string;
  current: string;
  tier: number | undefined;
  price: number | undefined;
};

function getSpecItems(build: BuildConfig): SpecItem[] {
  return [
    {
      label: 'CPU',
      current: build.cpu?.name ?? '—',
      tier: build.cpu?.tier,
      price: build.cpu?.price,
    },
    {
      label: 'GPU',
      current: build.gpu?.name ?? '—',
      tier: build.gpu?.tier,
      price: build.gpu?.price,
    },
    {
      label: 'RAM',
      current: build.ram?.name ?? '—',
      tier: build.ram?.tier,
      price: build.ram?.price,
    },
    {
      label: 'Storage',
      current: build.storage?.name ?? '—',
      tier: build.storage?.tier,
      price: build.storage?.price,
    },
    {
      label: 'Motherboard',
      current: build.motherboard?.name ?? '—',
      tier: build.motherboard?.tier,
      price: build.motherboard?.price,
    },
    {
      label: 'PSU',
      current: build.psu?.name ?? '—',
      tier: build.psu?.tier,
      price: build.psu?.price,
    },
  ];
}

function TierDots({ tier }: { tier: number | undefined }) {
  if (tier === undefined) return null;
  const max = 5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < tier ? 'bg-violet-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

export function BuildSummary({ build, totalPrice }: BuildSummaryProps) {
  const specs = getSpecItems(build);
  const configured = specs.filter((s) => s.current !== '—').length;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Build Summary</h2>
        <div className="text-right">
          <div className="text-xs text-slate-400">Est. Value</div>
          <div className="text-xl font-bold text-violet-300">${totalPrice.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Components selected</span>
          <span>{configured}/6</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${(configured / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Spec rows */}
      <div className="space-y-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-16 shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {spec.label}
              </span>
              <span
                className={`truncate text-sm ${
                  spec.current === '—' ? 'text-slate-600 italic' : 'text-slate-200'
                }`}
              >
                {spec.current}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <TierDots tier={spec.tier} />
              {spec.price !== undefined && (
                <span className="text-xs text-slate-400 w-16 text-right">
                  ${spec.price}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
