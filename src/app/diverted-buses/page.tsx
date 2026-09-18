'use client';

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ArrowRightLeft, 
  Bus as BusIcon, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  CheckCircle2, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { CustomDiversionForm } from '../../components/Dispatch/CustomDiversionForm';

export default function DivertedBusesPage() {
  const { buses, autoDivertEmptyBuses, divertBus, dispatchLogs, impactMetrics, dprMetrics } = useSimulation();

  const divertedBuses = buses.filter((b) => b.isDiverted);
  const totalDiverted = divertedBuses.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Hero Header Banner */}
      <section className="glass-card rounded-2xl border border-amber-500/30 p-6 space-y-4 bg-amber-950/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
                  PUBLIC & OPERATIONAL TELEMETRY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {totalDiverted} ACTIVE {totalDiverted === 1 ? 'DIVERSION' : 'DIVERSIONS'}
                </span>
              </div>
              <h1 className="text-2xl font-black font-mono text-white tracking-wide mt-1">
                DYNAMICALLY DIVERTED BUSES TRACKER
              </h1>
              <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                Real-time public visibility showing which buses have been temporarily moved from low-demand routes (Route 12) to serve high-demand corridors (Route 9 Express).
              </p>
            </div>
          </div>

          {/* Dynamic Diversion Action Button */}
          <button
            onClick={autoDivertEmptyBuses}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black font-mono font-black text-xs tracking-wider hover:brightness-125 shadow-glow-amber transition-all transform active:scale-95 flex items-center justify-center space-x-2 shrink-0"
          >
            <Zap className="h-4 w-4 fill-black" />
            <span>TRIGGER DYNAMIC DIVERSION (2 BUSES)</span>
          </button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono">
            <span className="text-[10px] text-gray-400 uppercase block">ACTIVE RE-ROUTED FLEET</span>
            <span className="text-lg font-bold text-amber-300">{totalDiverted} Vehicles</span>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono">
            <span className="text-[10px] text-gray-400 uppercase block">TARGET EXPRESS CORRIDOR</span>
            <span className="text-lg font-bold text-cyan-300">Route 9 Express</span>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono">
            <span className="text-[10px] text-gray-400 uppercase block">PASSENGER TIME SAVED</span>
            <span className="text-lg font-bold text-emerald-400">{Math.round(impactMetrics.passengerMinutesSaved)} min</span>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono">
            <span className="text-[10px] text-gray-400 uppercase block">NET HOURLY BENEFIT</span>
            <span className="text-lg font-bold text-emerald-300">+₹{dprMetrics.netBenefitRupees}/hr</span>
          </div>
        </div>
      </section>

      {/* Manual Custom Bus Diversion Form */}
      <CustomDiversionForm />

      {/* Main Section: Diverted Buses Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BusIcon className="h-5 w-5 text-amber-400" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              CURRENTLY DIVERTED VEHICLES DIRECTORY
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Live updates every 2.5 seconds
          </span>
        </div>

        {divertedBuses.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="font-mono text-base font-bold text-white">No Active Bus Diversions</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto font-mono">
              All BRTS buses are currently operating on their standard published routes. Click the button above to trigger an autonomous diversion when demand spikes.
            </p>
            <button
              onClick={autoDivertEmptyBuses}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40 hover:bg-amber-500/30 transition-all inline-flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Simulate Bus Rerouting</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {divertedBuses.map((bus) => {
              const sourceRouteName = bus.routeName || bus.routeId || 'Route 12 (Chandkheda - ISKCON)';
              const targetRouteName = bus.divertedTo || 'ROUTE_9_EXPRESS';
              const readableTarget = targetRouteName === 'ROUTE_9_EXPRESS' ? 'Route 9 Express (RTO -> LD Engg)' : targetRouteName;

              return (
                <div
                  key={bus.id}
                  className="glass-card-hover rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 space-y-4 relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                        <BusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white text-sm block">{bus.id}</span>
                        <span className="text-[10px] font-mono text-gray-400">{bus.busNumber}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow-amber">
                      EXPRESS 9X DIVERTED
                    </span>
                  </div>

                  {/* Route Reroute Flow Visual */}
                  <div className="rounded-xl bg-black/50 p-3 border border-white/10 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>ORIGINAL ROUTE:</span>
                      <span className="text-gray-200 font-semibold truncate max-w-[160px]" title={sourceRouteName}>
                        {sourceRouteName}
                      </span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 py-1 text-amber-400 font-bold">
                      <span className="h-0.5 flex-1 bg-amber-500/30" />
                      <span className="flex items-center space-x-1.5 text-[10px] bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 text-amber-300">
                        <span>RE-ASSIGNED TO</span>
                        <ArrowRightLeft className="h-3 w-3 text-amber-400" />
                      </span>
                      <span className="h-0.5 flex-1 bg-amber-500/30" />
                    </div>

                    <div className="flex items-center justify-between text-amber-300">
                      <span>ASSIGNED ROUTE:</span>
                      <span className="font-bold text-amber-300">{readableTarget}</span>
                    </div>
                  </div>

                  {/* Live Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>CURRENT LOCATION</span>
                      </span>
                      <span className="font-bold text-white block truncate" title={bus.currentStop}>
                        {bus.currentStop}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                        <Gauge className="h-3 w-3 text-emerald-400" />
                        <span>SPEED & LOAD</span>
                      </span>
                      <span className="font-bold text-emerald-400 block">
                        {bus.speedKmph} km/h · {bus.plfPercent}% PLF
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between text-gray-400">
                      <span>Occupancy</span>
                      <span className="text-white font-bold">{bus.currentPassengers} / {bus.capacity} seats</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, bus.plfPercent)}%` }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Audit Log Table Section */}
      <section className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              HISTORICAL DIVERSION DISPATCH LOG
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Real-time Audit Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">BUS ID</th>
                <th className="py-2.5 px-3">ORIGIN ROUTE</th>
                <th className="py-2.5 px-3">TARGET CORRIDOR</th>
                <th className="py-2.5 px-3">DPR RATIO</th>
                <th className="py-2.5 px-3">NET HOURLY SAVINGS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-cyan-300">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-white">{log.busId}</td>
                  <td className="py-3 px-3 text-gray-400">{log.sourceRoute}</td>
                  <td className="py-3 px-3 text-amber-300 font-semibold">{log.targetRoute}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{log.dpr}x</td>
                  <td className="py-3 px-3 text-emerald-300 font-bold">+₹{log.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Network Reference Footer */}
      <RouteReferencePanel />

    </div>
  );
}
