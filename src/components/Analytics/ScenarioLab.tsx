'use client';

import React from 'react';
import { CloudRain, Construction, RotateCcw, Siren, Zap } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { TransitScenario } from '../../types/brts';

const scenarios: { type: TransitScenario; label: string; detail: string; icon: typeof Zap }[] = [
  { type: 'PEAK_SURGE', label: 'Peak surge', detail: 'Overload Route 9 demand', icon: Zap },
  { type: 'STATION_CLOSURE', label: 'Station closure', detail: 'Reroute LD College queues', icon: Construction },
  { type: 'MONSOON_DELAY', label: 'Monsoon delay', detail: 'Reduce speeds and protect reliability', icon: CloudRain }
];

export const ScenarioLab: React.FC = () => {
  const { activeScenario, activateScenario, clearScenario } = useSimulation();

  return (
    <section className="glass-card rounded-2xl border border-orange-200/80 bg-orange-50/35 p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <div className="rounded-lg bg-[#163b64] p-2 text-[#f28c28]"><Siren className="h-4 w-4" /></div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#163b64]">Resilience scenario lab</div>
            <h2 className="text-sm font-bold text-slate-900">Test a disruption before it reaches passengers</h2>
          </div>
        </div>
        {activeScenario && <button onClick={clearScenario} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:border-orange-300"><RotateCcw className="h-3 w-3" /> Restore baseline</button>}
      </div>
      {activeScenario ? (
        <div className="rounded-xl border border-orange-200 bg-white/70 p-3 text-xs">
          <div className="flex items-center justify-between gap-2"><strong className="text-orange-800">Active: {activeScenario.label}</strong><span className="rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[10px] text-orange-800">LIVE TEST</span></div>
          <p className="mt-1 text-slate-600">{activeScenario.description} Recommendations and impact metrics are recalculating from this scenario.</p>
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed text-slate-600">Run a controlled disruption to demonstrate how the network responds, then restore the live baseline.</p>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {scenarios.map(({ type, label, detail, icon: Icon }) => (
          <button key={type} onClick={() => activateScenario(type)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2.5 text-left transition hover:border-orange-300 hover:bg-orange-50">
            <Icon className="h-4 w-4 shrink-0 text-[#e87518]" />
            <span><strong className="block text-[11px] text-slate-800">{label}</strong><span className="text-[10px] text-slate-500">{detail}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
};
