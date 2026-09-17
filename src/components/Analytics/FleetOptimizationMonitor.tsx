'use client';

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Bus, ArrowRightLeft, ShieldCheck, Zap, AlertCircle, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { RouteFleetOptimization } from '../../types/brts';

export const FleetOptimizationMonitor: React.FC = () => {
  const { buses, divertBus, autoDivertEmptyBuses } = useSimulation();

  // Route 12 Low-Rush Analysis
  const route12Buses = buses.filter(b => b.routeId === 'ROUTE_12');
  const route9Buses = buses.filter(b => b.routeId === 'ROUTE_9');

  const totalPaxR12 = route12Buses.reduce((acc, b) => acc + b.currentPassengers, 0);
  const avgPlfR12 = route12Buses.length
    ? parseFloat((route12Buses.reduce((acc, b) => acc + b.plfPercent, 0) / route12Buses.length).toFixed(1))
    : 0;

  // Target 52 passengers per bus (75% PLF)
  const OPTIMAL_PAX_PER_BUS = 52;
  const requiredBusesR12 = Math.max(1, Math.ceil(totalPaxR12 / OPTIMAL_PAX_PER_BUS));
  const excessBusesR12 = Math.max(0, route12Buses.filter(b => !b.isDiverted).length - requiredBusesR12);

  // Identify Underutilized / Empty Buses (PLF < 30%)
  const emptyBuses = route12Buses.filter(b => b.plfPercent < 35 && !b.isDiverted);
  const divertedCount = buses.filter(b => b.isDiverted).length;

  const route12Optimization: RouteFleetOptimization = {
    routeId: 'ROUTE_12',
    routeName: 'Corridor 12 (RTO Circle ➔ CTM Cross Road)',
    totalActiveBuses: route12Buses.length,
    totalPassengersOnRoute: totalPaxR12,
    avgPlfPercent: avgPlfR12,
    requiredBusesCount: requiredBusesR12,
    excessBusesCount: excessBusesR12,
    emptyBuses: emptyBuses,
    recommendationText: excessBusesR12 > 0
      ? `Route 12 has ${totalPaxR12} total passengers across ${route12Buses.length} buses. Only ${requiredBusesR12} buses required! ${excessBusesR12} excess buses identified for reallocation.`
      : `Route 12 fleet is currently optimized for current passenger volume.`
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-orange-300/60 bg-orange-50/35 space-y-6">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-bold shadow-glow-amber">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-mono text-white tracking-wider flex items-center space-x-2">
              <span>FLEET SIZING & LOW-RUSH BUS OPTIMIZATION</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DYNAMIC RATIONALIZATION
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Real-Time Fleet Demand Rationalization Engine — Prevents Empty Bus Runs & Reallocates Excess Fleet
            </p>
          </div>
        </div>

        {/* Global Auto Reallocate Button */}
        <button
          onClick={autoDivertEmptyBuses}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-mono font-black text-xs tracking-wider shadow-glow-amber hover:brightness-110 transition-all flex items-center space-x-2"
        >
          <Zap className="h-4 w-4 fill-black" />
          <span>⚡ AUTO-REALLOCATE EXCESS BUSES NOW</span>
        </button>
      </div>

      {/* Low Rush Corridor Analysis Card */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
              LOW-RUSH CORRIDOR EVALUATION: ROUTE 12
            </span>
              <h3 className="text-base font-bold font-mono text-white">
              {route12Optimization.routeName}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              🟢 LOW DEMAND (AVG {avgPlfR12}% PLF)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {divertedCount} BUSES REALLOCATED
            </span>
          </div>
        </div>

        {/* 3 Step Fleet Sizing Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          {/* Active vs Required */}
            <div className="p-3.5 rounded-xl bg-white/60 border border-slate-200 space-y-1">
            <span className="text-gray-400 text-[10px] block">ACTIVE FLEET VS REQUIRED</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">{route12Optimization.totalActiveBuses} Buses</span>
              <span className="text-amber-400 font-bold">➔ Need {route12Optimization.requiredBusesCount}</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Total Demand: <strong className="text-white">{route12Optimization.totalPassengersOnRoute} Pax</strong> on Route 12
            </p>
          </div>

          {/* Excess Fleet Identified */}
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1">
            <span className="text-amber-400 text-[10px] block font-bold">EXCESS UNNEEDED BUSES</span>
            <div className="text-2xl font-black text-amber-300">
              {route12Optimization.excessBusesCount} Surplus Vehicles
            </div>
            <p className="text-[10px] text-gray-300">
              Running below optimal load threshold (&lt;30% PLF)
            </p>
          </div>

          {/* Operations directive */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-emerald-400 text-[10px] block font-bold">OPTIMIZATION IMPACT</span>
            <div className="text-sm font-bold text-white">
              +₹4,820/hr Net DPR Benefit
            </div>
            <p className="text-[10px] text-emerald-300">
              Absorbs Route 9 surge without adding new fleet
            </p>
          </div>

        </div>

        {/* Recommendation Text Banner */}
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-mono text-amber-200 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{route12Optimization.recommendationText}</span>
        </div>
      </div>

      {/* Empty / Low-Rush Bus Telemetry List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span className="font-bold text-white uppercase flex items-center space-x-1.5">
            <Bus className="h-4 w-4 text-amber-400" />
            <span>IDENTIFIED UNDERUTILIZED & EMPTY BUS TELEMETRY (PLF &lt; 35%)</span>
          </span>
          <span>{emptyBuses.length} Candidates Ready for Reallocation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {emptyBuses.map((bus) => (
            <div
              key={bus.id}
              className="p-4 rounded-2xl bg-white/65 border border-orange-200 hover:border-orange-400 transition-all space-y-3 font-mono text-xs"
            >
              {/* Bus Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <span className="font-bold text-amber-300 text-sm">{bus.id}</span>
                  <span className="text-[10px] text-gray-400 block">{bus.busNumber}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {bus.plfPercent}% PLF (LOW)
                </span>
              </div>

              {/* Load Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[9px]">SEATS FILLED</span>
                  <span className="text-white font-bold">{bus.currentPassengers} / {bus.capacity}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">VACANT SEATS</span>
                  <span className="text-emerald-400 font-bold">{bus.capacity - bus.currentPassengers} Seats</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[9px]">CURRENT LOCATION</span>
                  <span className="text-cyan-300 font-semibold">{bus.currentStop} ({bus.speedKmph} km/h)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>Passenger Load Meter</span>
                  <span className="text-emerald-400 font-bold">{bus.plfPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, bus.plfPercent)}%` }}
                  />
                </div>
              </div>

              {/* Reallocate Action Button */}
              <button
                onClick={() => divertBus(bus.id, 'ROUTE_9_EXPRESS')}
                className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-mono font-bold text-xs border border-amber-500/40 transition-all flex items-center justify-center space-x-1.5 shadow-glow-amber"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>REALLOCATE TO HIGH-RUSH ROUTE 9</span>
              </button>
            </div>
          ))}

          {emptyBuses.length === 0 && (
            <div className="col-span-3 p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center text-xs font-mono text-emerald-700 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <span>All empty/underutilized buses have been successfully reallocated to high-surge corridors!</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
