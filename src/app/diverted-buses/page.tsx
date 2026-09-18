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
      <section className="glass-card rounded-2xl border border-orange-300 p-6 space-y-4 bg-orange-50/70 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-800 border border-orange-300 shadow-2xs">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-orange-900 tracking-wider uppercase">
                  PUBLIC & OPERATIONAL TELEMETRY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-200 text-orange-900 border border-orange-300 animate-pulse">
                  {totalDiverted} ACTIVE {totalDiverted === 1 ? 'DIVERSION' : 'DIVERSIONS'}
                </span>
              </div>
              <h1 className="text-2xl font-black font-mono text-[#0F172A] tracking-wide mt-1">
                DYNAMICALLY DIVERTED BUSES TRACKER
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
                Real-time public visibility showing which buses have been temporarily moved from low-demand routes (Route 12) to serve high-demand corridors (Route 9 Express).
              </p>
            </div>
          </div>

          {/* Dynamic Diversion Action Button */}
          <button
            onClick={autoDivertEmptyBuses}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-mono font-black text-xs tracking-wider shadow-brts-saffron hover:brightness-110 transition-all border border-orange-500 flex items-center justify-center space-x-2 shrink-0"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>TRIGGER DYNAMIC DIVERSION (2 BUSES)</span>
          </button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-white border border-orange-200 p-3 font-mono shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">ACTIVE RE-ROUTED FLEET</span>
            <span className="text-lg font-bold text-orange-900">{totalDiverted} Vehicles</span>
          </div>

          <div className="rounded-xl bg-white border border-orange-200 p-3 font-mono shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">TARGET EXPRESS CORRIDOR</span>
            <span className="text-lg font-bold text-[#0F172A]">Route 9 Express</span>
          </div>

          <div className="rounded-xl bg-white border border-orange-200 p-3 font-mono shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">PASSENGER TIME SAVED</span>
            <span className="text-lg font-bold text-emerald-800">{Math.round(impactMetrics.passengerMinutesSaved)} min</span>
          </div>

          <div className="rounded-xl bg-white border border-orange-200 p-3 font-mono shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">NET HOURLY BENEFIT</span>
            <span className="text-lg font-bold text-emerald-800">+₹{dprMetrics.netBenefitRupees}/hr</span>
          </div>
        </div>
      </section>

      {/* Manual Custom Bus Diversion Form */}
      <CustomDiversionForm />

      {/* Main Section: Diverted Buses Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BusIcon className="h-5 w-5 text-orange-600" />
            <h2 className="font-mono text-base font-bold text-[#0F172A] tracking-wide">
              CURRENTLY DIVERTED VEHICLES DIRECTORY
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Live updates every 2.5 seconds
          </span>
        </div>

        {divertedBuses.length === 0 ? (
          <div className="glass-card rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-sm">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="font-mono text-base font-bold text-[#0F172A]">No Active Bus Diversions</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-mono font-medium">
              All BRTS buses are currently operating on their standard published routes. Click the button above to trigger an autonomous diversion when demand spikes.
            </p>
            <button
              onClick={autoDivertEmptyBuses}
              className="px-4 py-2 rounded-xl bg-orange-100 text-orange-900 font-mono font-bold text-xs border border-orange-300 hover:bg-orange-200 transition-all inline-flex items-center space-x-2"
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
                  className="glass-card rounded-2xl p-5 border border-orange-200 bg-white space-y-4 shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 flex items-center justify-center font-bold">
                        <BusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-[#0F172A] text-sm block">{bus.id}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">{bus.busNumber}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-300">
                      EXPRESS 9X DIVERTED
                    </span>
                  </div>

                  {/* Route Reroute Flow Visual */}
                  <div className="rounded-xl bg-orange-50/70 p-3 border border-orange-200 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>ORIGINAL ROUTE:</span>
                      <span className="text-slate-900 font-bold truncate max-w-[160px]" title={sourceRouteName}>
                        {sourceRouteName}
                      </span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 py-1 text-orange-800 font-bold">
                      <span className="h-0.5 flex-1 bg-orange-300" />
                      <span className="flex items-center space-x-1.5 text-[10px] bg-orange-200 px-2.5 py-0.5 rounded-full border border-orange-300 text-orange-900">
                        <span>RE-ASSIGNED TO</span>
                        <ArrowRightLeft className="h-3 w-3 text-orange-800" />
                      </span>
                      <span className="h-0.5 flex-1 bg-orange-300" />
                    </div>

                    <div className="flex items-center justify-between text-orange-900">
                      <span>ASSIGNED ROUTE:</span>
                      <span className="font-bold text-orange-900">{readableTarget}</span>
                    </div>
                  </div>

                  {/* Live Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-bold">
                        <MapPin className="h-3 w-3 text-orange-600" />
                        <span>CURRENT LOCATION</span>
                      </span>
                      <span className="font-bold text-[#0F172A] block truncate" title={bus.currentStop}>
                        {bus.currentStop}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-bold">
                        <Gauge className="h-3 w-3 text-emerald-600" />
                        <span>SPEED & LOAD</span>
                      </span>
                      <span className="font-bold text-emerald-800 block">
                        {bus.speedKmph} km/h · {bus.plfPercent}% PLF
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>Occupancy</span>
                      <span className="text-[#0F172A] font-bold">{bus.currentPassengers} / {bus.capacity} seats</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
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
      <section className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <h2 className="font-mono text-base font-bold text-[#0F172A] tracking-wide">
              HISTORICAL DIVERSION DISPATCH LOG
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Real-time Audit Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold bg-slate-50">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">BUS ID</th>
                <th className="py-2.5 px-3">ORIGIN ROUTE</th>
                <th className="py-2.5 px-3">TARGET CORRIDOR</th>
                <th className="py-2.5 px-3">DPR RATIO</th>
                <th className="py-2.5 px-3">NET HOURLY SAVINGS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-orange-900 font-semibold">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-[#0F172A]">{log.busId}</td>
                  <td className="py-3 px-3 text-slate-600">{log.sourceRoute}</td>
                  <td className="py-3 px-3 text-orange-800 font-semibold">{log.targetRoute}</td>
                  <td className="py-3 px-3 text-emerald-800 font-bold">{log.dpr}x</td>
                  <td className="py-3 px-3 text-emerald-800 font-bold">+₹{log.benefit}</td>
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
