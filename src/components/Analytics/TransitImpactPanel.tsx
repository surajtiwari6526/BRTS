'use client';

import React from 'react';
import { Activity, Droplets, Leaf, ShieldCheck, Timer, Users } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const TransitImpactPanel: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { impactMetrics } = useSimulation();

  const metrics = [
    { label: 'Passenger minutes saved', value: impactMetrics.passengerMinutesSaved.toLocaleString(), suffix: 'min', icon: Timer, tone: 'text-[#163b64]' },
    { label: 'Diesel-equivalent avoided', value: impactMetrics.estimatedFuelLitersAvoided.toFixed(1), suffix: 'L', icon: Droplets, tone: 'text-[#e87518]' },
    { label: 'CO2 avoided estimate', value: impactMetrics.estimatedCo2KgAvoided.toFixed(1), suffix: 'kg', icon: Leaf, tone: 'text-[#2f8f5b]' },
    { label: 'Network balance', value: impactMetrics.networkBalanceScore, suffix: '/100', icon: Activity, tone: 'text-[#163b64]' },
    { label: 'Service resilience', value: impactMetrics.resilienceScore, suffix: '/100', icon: ShieldCheck, tone: 'text-[#2f8f5b]' }
  ];

  return (
    <section className={`glass-card rounded-2xl border border-slate-300 ${compact ? 'p-4' : 'p-5'} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#163b64]">
            <Users className="h-4 w-4" /> Transit impact ledger
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">Every dispatch decision has a measurable outcome</h2>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-mono font-bold text-emerald-700">LIVE MODEL</span>
      </div>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-5'}`}>
        {metrics.map(({ label, value, suffix, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white/65 p-3">
            <Icon className={`h-4 w-4 ${tone}`} />
            <div className="mt-2 font-mono text-lg font-bold text-slate-900">{value}<span className="ml-1 text-[10px] font-normal text-slate-500">{suffix}</span></div>
            <div className="mt-1 text-[10px] leading-tight text-slate-500">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] leading-relaxed text-slate-500">Estimates use current fleet load, diversion count, DPR wait-time value, and a transparent 4.8 L deadhead proxy per reallocated bus. They are decision support, not audited emissions reporting.</p>
    </section>
  );
};
