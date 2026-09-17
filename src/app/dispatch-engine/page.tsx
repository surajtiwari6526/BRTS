'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Cpu, 
  ArrowRightLeft, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Users, 
  Sliders, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';

export default function DispatchEnginePage() {
  const { buses, autoDivertEmptyBuses, divertBus, dprMetrics, updateDPRParams, dispatchLogs } = useSimulation();

  const [wSavedInput, setWSavedInput] = useState<number>(dprMetrics.wSavedMin);
  const [fuelCostInput, setFuelCostInput] = useState<number>(dprMetrics.cDeadheadRupees);

  // Corridor A: Route 9 metrics
  const route9Buses = buses.filter(b => b.routeId === 'ROUTE_9');
  const route9AvgPlf = (route9Buses.reduce((acc, b) => acc + b.plfPercent, 0) / (route9Buses.length || 1)).toFixed(1);

  // Corridor B: Route 12 metrics
  const route12Buses = buses.filter(b => b.routeId === 'ROUTE_12');
  const route12AvgPlf = (route12Buses.reduce((acc, b) => acc + b.plfPercent, 0) / (route12Buses.length || 1)).toFixed(1);

  // Diverted buses count
  const divertedBuses = buses.filter(b => b.isDiverted);

  const handleSliderChange = (w: number, c: number) => {
    setWSavedInput(w);
    setFuelCostInput(c);
    updateDPRParams(w, c);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#0A0D14] p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Title & AI Matrix Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-wide">
                AI DISPATCH & DIVERSION BALANCER STUDIO
              </h1>
              <p className="text-xs text-gray-400">
                Autonomous Corridor Load Balancer & Dynamic Rerouting Optimization Engine
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Auto Divert Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={autoDivertEmptyBuses}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black font-mono font-black text-sm tracking-wider hover:brightness-125 shadow-glow-cyan transition-all transform active:scale-95 flex items-center space-x-2"
          >
            <Zap className="h-5 w-5 fill-black" />
            <span>APPROVE DYNAMIC DIVERSION (2 EMPTY BUSES)</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Corridor Load Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Corridor 1: Route 9 (Congested) */}
        <div className="glass-card rounded-2xl p-6 border border-red-500/30 space-y-4 bg-gradient-to-br from-red-950/20 to-obsidian">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                CRITICAL CONGESTION CORRIDOR
              </span>
              <h2 className="text-lg font-bold font-mono text-white mt-1">
                Route 9: RTO Circle → LD College
              </h2>
            </div>
            <span className="text-2xl font-black font-mono text-red-400">{route9AvgPlf}% PLF</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">WAIT TIME</span>
              <span className="text-lg font-bold font-mono text-red-300">24 mins</span>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">WAITING PAX</span>
              <span className="text-lg font-bold font-mono text-white">{dprMetrics.pWaitingPax} pax</span>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">BUS COUNT</span>
              <span className="text-lg font-bold font-mono text-red-400">{route9Buses.length} Active</span>
            </div>
          </div>

          <p className="text-xs text-gray-300">
            High-rush university & tech park corridor experiencing severe commuter bottleneck. PLF exceeds capacity by 12-17%.
          </p>
        </div>

        {/* Corridor 2: Route 12 (Underutilized) */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 space-y-4 bg-gradient-to-br from-emerald-950/20 to-obsidian">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                UNDERUTILIZED CAPACITY CORRIDOR
              </span>
              <h2 className="text-lg font-bold font-mono text-white mt-1">
                Route 12: RTO Circle → CTM Cross Road
              </h2>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-400">{route12AvgPlf}% PLF</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">WAIT TIME</span>
              <span className="text-lg font-bold font-mono text-emerald-300">3 mins</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">WAITING PAX</span>
              <span className="text-lg font-bold font-mono text-white">32 pax</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 font-mono block">BUS COUNT</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{route12Buses.length} Active</span>
            </div>
          </div>

          <p className="text-xs text-gray-300">
            Heritage & residential corridor running under capacity. Empty seating available for dynamic rerouting to Route 9 Express.
          </p>
        </div>

      </div>

      {/* DPR Formula & Algorithmic Recommendation Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#00F2FE]">ALGORITHMIC DECISION ENGINE</span>
            <h2 className="text-lg font-bold font-mono text-white">
              Diversion Profitability Ratio (DPR) Model
            </h2>
          </div>

          {/* Dynamic Status Badge */}
          <div className={`px-4 py-2 rounded-xl font-mono text-sm font-bold flex items-center space-x-2 border shadow-lg ${
            dprMetrics.isRecommended
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-glow-green'
              : 'bg-gray-500/20 text-gray-300 border-gray-500/50'
          }`}>
            <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span>
              {dprMetrics.isRecommended 
                ? `DIVERSION RECOMMENDED: DPR ${dprMetrics.dprRatio}x (Net +₹${dprMetrics.netBenefitRupees}/hr)` 
                : 'MAINTAIN STANDARD SCHEDULE'}
            </span>
          </div>
        </div>

        {/* Mathematical Equation Card */}
        <div className="p-6 rounded-2xl bg-[#111622] border border-white/10 space-y-4">
          <div className="text-center font-mono text-lg md:text-xl text-cyan-300 font-bold bg-[#0A0D14] p-4 rounded-xl border border-cyan-500/30">
            Net Benefit = (W<sub>saved</sub> × P<sub>waiting</sub>) - (C<sub>deadhead</sub> + D<sub>route12_delay</sub>)
          </div>

          {/* Breakdown parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 block">W<sub>saved</sub> (Time Saved)</span>
              <span className="text-lg font-bold text-emerald-400">{dprMetrics.wSavedMin} mins / pax</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 block">P<sub>waiting</sub> (Surge Demand)</span>
              <span className="text-lg font-bold text-white">{dprMetrics.pWaitingPax} passengers</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 block">C<sub>deadhead</sub> (Fuel Cost)</span>
              <span className="text-lg font-bold text-amber-400">₹{dprMetrics.cDeadheadRupees}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 block">D<sub>route12_delay</sub> (Transfer Cost)</span>
              <span className="text-lg font-bold text-gray-300">₹{dprMetrics.dRoute12DelayRupees}</span>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
              <Sliders className="h-4 w-4" />
              <span>TEST SIMULATION PARAMETER SLIDERS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div>
                <label className="text-gray-300 flex justify-between mb-1">
                  <span>Passenger Wait Time Saved (W<sub>saved</sub>):</span>
                  <span className="text-cyan-300 font-bold">{wSavedInput} mins</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={wSavedInput}
                  onChange={(e) => handleSliderChange(Number(e.target.value), fuelCostInput)}
                  className="w-full accent-[#00F2FE]"
                />
              </div>

              <div>
                <label className="text-gray-300 flex justify-between mb-1">
                  <span>Deadhead Reroute Fuel Cost (C<sub>deadhead</sub>):</span>
                  <span className="text-amber-300 font-bold">₹{fuelCostInput}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={fuelCostInput}
                  onChange={(e) => handleSliderChange(wSavedInput, Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Diverted Vehicles Telemetry Cards & Audit Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diverted Buses Card Panel */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <ArrowRightLeft className="h-4 w-4 text-amber-400" />
              <span>ACTIVE DIVERTED VEHICLES</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {divertedBuses.length} Buses
            </span>
          </div>

          <div className="space-y-3">
            {divertedBuses.map((bus) => (
              <div key={bus.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{bus.id} ({bus.busNumber})</span>
                  <span className="text-[10px] bg-amber-400 text-black font-bold px-2 py-0.5 rounded">
                    REROUTED 9X
                  </span>
                </div>
                <div className="text-gray-300 text-[11px]">
                  Target: <span className="text-white font-bold">RTO → LD College Express</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Speed: {bus.speedKmph} km/h</span>
                  <span>Passengers: {bus.currentPassengers}/{bus.capacity}</span>
                </div>
              </div>
            ))}

            {divertedBuses.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400 font-mono">
                No buses currently diverted. Click "Approve Dynamic Diversion" above to reroute BUS-1201 and BUS-1205.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Dispatch Audit Logs Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>DISPATCH TELEMETRY AUDIT LOG</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">Live Timestamped</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">BUS ID</th>
                  <th className="py-2 px-3">ORIGIN ROUTE</th>
                  <th className="py-2 px-3">TARGET CORRIDOR</th>
                  <th className="py-2 px-3">DPR RATIO</th>
                  <th className="py-2 px-3">NET BENEFIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dispatchLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-300">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{log.busId}</td>
                    <td className="py-2.5 px-3 text-gray-400">{log.sourceRoute}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">{log.targetRoute}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{log.dpr}x</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-bold">+₹{log.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
