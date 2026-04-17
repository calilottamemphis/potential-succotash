import { useState } from 'react';
import { useBuildStore } from './store/buildStore';
import { ComponentSelector } from './components/ComponentSelector';
import { UsageScenarioForm } from './components/UsageScenarioForm';
import { BottleneckVisualizer } from './components/BottleneckVisualizer';
import { UpgradeCard } from './components/UpgradeCard';
import { BuildSummary } from './components/BuildSummary';
import { detectBottlenecks } from './logic/bottleneckDetection';
import { generateUpgradeRecommendations } from './logic/upgradeEngine';
import componentsData from './data/components.json';
import type { CPU, GPU, RAM, Storage, PSU, Motherboard } from './types';

const cpus = componentsData.cpus as CPU[];
const gpus = componentsData.gpus as GPU[];
const rams = componentsData.rams as RAM[];
const storages = componentsData.storages as Storage[];
const psus = componentsData.psus as PSU[];
const motherboards = componentsData.motherboards as Motherboard[];

function App() {
  const { cpu, gpu, ram, storage, psu, motherboard, usage, setBuildField, setUsage, resetBuild } =
    useBuildStore();
  const [budget, setBudget] = useState(500);
  const [showResults, setShowResults] = useState(false);

  const build = { cpu, gpu, ram, storage, psu, motherboard };

  const hasMinimumBuild = cpu !== null || gpu !== null;

  const bottleneckResult = hasMinimumBuild
    ? detectBottlenecks(build, usage)
    : null;

  const recommendations = hasMinimumBuild
    ? generateUpgradeRecommendations(build, usage)
    : [];

  const filteredRecs = recommendations.filter(
    (r) => r.priceDelta <= budget
  );

  const totalPrice = [
    cpu?.price ?? 0,
    gpu?.price ?? 0,
    ram?.price ?? 0,
    storage?.price ?? 0,
    psu?.price ?? 0,
    motherboard?.price ?? 0,
  ].reduce((sum, p) => sum + p, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">PC Optimizer</h1>
              <p className="text-xs text-slate-400">Bottleneck detection & upgrade recommendations</p>
            </div>
          </div>
          <button
            onClick={resetBuild}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Usage + Budget */}
        <UsageScenarioForm
          usage={usage}
          budget={budget}
          onChange={setUsage}
          onBudgetChange={setBudget}
        />

        {/* Component Selection Grid */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Your Current Build</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ComponentSelector
              label="CPU"
              options={cpus}
              value={cpu}
              onChange={(v) => setBuildField('cpu', v)}
              getLabel={(c) => `${c.name} — $${c.price}`}
              placeholder="Select CPU..."
            />
            <ComponentSelector
              label="GPU"
              options={gpus}
              value={gpu}
              onChange={(v) => setBuildField('gpu', v)}
              getLabel={(g) => `${g.name} — $${g.price}`}
              placeholder="Select GPU..."
            />
            <ComponentSelector
              label="RAM"
              options={rams}
              value={ram}
              onChange={(v) => setBuildField('ram', v)}
              getLabel={(r) => `${r.name} — $${r.price}`}
              placeholder="Select RAM..."
            />
            <ComponentSelector
              label="Storage"
              options={storages}
              value={storage}
              onChange={(v) => setBuildField('storage', v)}
              getLabel={(s) => `${s.name} — $${s.price}`}
              placeholder="Select Storage..."
            />
            <ComponentSelector
              label="Motherboard"
              options={motherboards}
              value={motherboard}
              onChange={(v) => setBuildField('motherboard', v)}
              getLabel={(m) => `${m.name} — $${m.price}`}
              placeholder="Select Motherboard..."
            />
            <ComponentSelector
              label="PSU"
              options={psus}
              value={psu}
              onChange={(v) => setBuildField('psu', v)}
              getLabel={(p) => `${p.name} — $${p.price}`}
              placeholder="Select PSU..."
            />
          </div>

          {hasMinimumBuild && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowResults(true)}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
              >
                Analyze Build →
              </button>
            </div>
          )}
        </section>

        {/* Results area */}
        {(showResults || hasMinimumBuild) && bottleneckResult && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Build Summary */}
            <div className="lg:col-span-1 space-y-6">
              <BuildSummary build={build} totalPrice={totalPrice} />
            </div>

            {/* Right: Analysis + Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <BottleneckVisualizer result={bottleneckResult} />

              {/* Upgrade Recommendations */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-100">
                    Upgrade Recommendations
                  </h2>
                  <span className="text-sm text-slate-400">
                    Budget: <span className="text-violet-300 font-medium">${budget.toLocaleString()}</span>
                  </span>
                </div>

                {filteredRecs.length === 0 && recommendations.length > 0 && (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center text-slate-400 text-sm">
                    All recommended upgrades exceed your ${budget.toLocaleString()} budget.
                    Try increasing your budget to see suggestions.
                  </div>
                )}

                {filteredRecs.length === 0 && recommendations.length === 0 && (
                  <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-4 text-center text-emerald-300 text-sm">
                    🎉 Your build is well-optimized for the selected usage scenario!
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {filteredRecs.map((rec, i) => (
                    <UpgradeCard key={`${rec.component}-${i}`} recommendation={rec} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {!hasMinimumBuild && (
          <div className="rounded-xl border border-dashed border-slate-600 p-12 text-center space-y-2">
            <p className="text-3xl">🖥️</p>
            <p className="text-slate-400">
              Select at least a CPU or GPU above to start the bottleneck analysis.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-700 py-6 text-center text-xs text-slate-500">
        PC Optimizer — Static MVP. Component data is approximate.
      </footer>
    </div>
  );
}

export default App;
