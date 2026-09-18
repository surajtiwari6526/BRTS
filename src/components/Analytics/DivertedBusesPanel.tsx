'use client';

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ArrowRightLeft, Bus as BusIcon, MapPin, Gauge, ShieldCheck } from 'lucide-react';

interface DivertedBusesPanelProps {
  compact?: boolean;
}

export function DivertedBusesPanel({ compact = false }: DivertedBusesPanelProps) {
  const { buses } = useSimulation();

  const divertedBuses = buses.filter((b) => b.isDiverted);

  return (
    <div className="glass-card rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4 space-y-3">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white tracking-wide">
              DIVERTED BUSES TRACKER
            </h3>
            <p className="text-[11px] text-gray-400">
              Live tracking of rerouted vehicles and their target express corridors
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse">
            {divertedBuses.length} {divertedBuses.length === 1 ? 'Bus Diverted' : 'Buses Diverted'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      {divertedBuses.length === 0 ? (
        <div className="flex items-center justify-center p-6 text-center rounded-xl bg-white/5 border border-white/5 text-gray-400 font-mono text-xs space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>All fleet vehicles are operating on their standard published routes. No active diversions.</span>
        </div>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {divertedBuses.map((bus) => {
            const sourceRouteName = bus.routeName || bus.routeId || 'Route 12';
            const targetRouteName = bus.divertedTo || 'ROUTE_9_EXPRESS';
            const readableTarget = targetRouteName === 'ROUTE_9_EXPRESS' ? 'Route 9 Express' : targetRouteName;

            return (
              <div
                key={bus.id}
                className="glass-card-hover rounded-xl p-3.5 border border-amber-500/30 bg-amber-950/20 space-y-3 relative overflow-hidden"
              >
                {/* Background Accent glow */}
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

                {/* Top Row: Bus ID & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BusIcon className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-mono font-bold text-white text-xs block">{bus.id}</span>
                      <span className="text-[10px] font-mono text-gray-400">{bus.busNumber}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    DIVERTED
                  </span>
                </div>

                {/* Route Shifting Visual Indicator */}
                <div className="rounded-lg bg-black/40 p-2 border border-white/10 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Original Route:</span>
                    <span className="text-gray-300 font-semibold truncate max-w-[140px]" title={sourceRouteName}>
                      {sourceRouteName}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 py-0.5 text-amber-400 font-bold">
                    <span className="h-0.5 flex-1 bg-amber-500/30" />
                    <span className="flex items-center space-x-1 text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      <span>RE-ROUTED TO</span>
                      <ArrowRightLeft className="h-3 w-3" />
                    </span>
                    <span className="h-0.5 flex-1 bg-amber-500/30" />
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <span>Assigned Route:</span>
                    <span className="font-bold text-amber-300">{readableTarget}</span>
                  </div>
                </div>

                {/* Current Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="flex items-center space-x-1.5 text-gray-300 bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate" title={bus.currentStop}>{bus.currentStop}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 bg-white/5 p-1.5 rounded-lg border border-white/5 justify-between">
                    <div className="flex items-center space-x-1">
                      <Gauge className="h-3.5 w-3.5 shrink-0" />
                      <span>{bus.speedKmph} km/h</span>
                    </div>
                    <span className="text-[10px] text-gray-400">({bus.plfPercent}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
