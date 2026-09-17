'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '../../context/SimulationContext';
import { StationTicketingMonitor } from '../../components/Analytics/StationTicketingMonitor';
import { FleetOptimizationMonitor } from '../../components/Analytics/FleetOptimizationMonitor';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { TransitImpactPanel } from '../../components/Analytics/TransitImpactPanel';
import { ScenarioLab } from '../../components/Analytics/ScenarioLab';

const BusMap = dynamic(() => import('../../components/Map/BusMap').then((mod) => mod.BusMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0A0D14] text-cyan-400 font-mono text-sm rounded-2xl border border-white/10">
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>LOADING REAL-TIME TELEMETRY MAP...</span>
      </div>
    </div>
  )
});
import { 
  Activity,
  Bus as BusIcon, 
  AlertTriangle, 
  ArrowRightLeft, 
  Users, 
  Gauge, 
  Filter, 
  Search, 
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { BusStatus } from '../../types/brts';

export default function CommandCenterPage() {
  const { buses, divertBus, dprMetrics } = useSimulation();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Summary Metrics
  const totalFleet = buses.length;
  const overloadedCount = buses.filter(b => b.status === 'CRITICAL_OVERLOAD' || b.status === 'OVERLOAD').length;
  const divertedCount = buses.filter(b => b.isDiverted).length;
  const avgPlf = (buses.reduce((acc, b) => acc + b.plfPercent, 0) / (totalFleet || 1)).toFixed(1);

  // Filtered Buses
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch = bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bus.currentStop.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'OVERLOAD') {
      return bus.status === 'CRITICAL_OVERLOAD' || bus.status === 'OVERLOAD';
    }
    if (filterStatus === 'DIVERTED') {
      return bus.isDiverted;
    }
    if (filterStatus === 'ROUTE_9') {
      return bus.routeId === 'ROUTE_9';
    }
    if (filterStatus === 'ROUTE_12') {
      return bus.routeId === 'ROUTE_12';
    }
    return true;
  });

  const selectedBus = buses.find(b => b.id === selectedBusId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-transparent p-4 lg:p-6 space-y-4 overflow-y-auto overflow-x-hidden">
      
      {/* KPI Top Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BusIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-mono">ACTIVE FLEET</div>
            <div className="text-lg font-bold font-mono text-white">{totalFleet} Buses</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-mono">OVERLOADED BUSES</div>
            <div className="text-lg font-bold font-mono text-red-400">{overloadedCount} (Route 9)</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-mono">ACTIVE DIVERSIONS</div>
            <div className="text-lg font-bold font-mono text-amber-300">{divertedCount} Express 9X</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-mono">AVG FLEET PLF RATE</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{avgPlf}%</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card rounded-2xl p-3 border border-white/10 flex items-center space-x-3 col-span-2 md:col-span-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-mono">DPR RECOMMENDATION</div>
            <div className="text-xs font-bold font-mono text-cyan-300">
              {dprMetrics.isRecommended ? `DPR ${dprMetrics.dprRatio}x (+₹${dprMetrics.netBenefitRupees}/h)` : 'STANDBY'}
            </div>
          </div>
        </div>

      </div>

      <RouteReferencePanel compact />
      <TransitImpactPanel compact />
      <ScenarioLab />

      {/* Main Viewport Container */}
      <div className="grid min-h-[540px] grid-cols-1 lg:grid-cols-12 gap-4 h-[min(540px,70vh)] lg:h-[540px] shrink-0">
        
        {/* Full-Screen Map Viewport */}
        <div className="lg:col-span-8 h-full relative overflow-hidden rounded-2xl">
          <BusMap
            buses={buses}
            selectedBusId={selectedBusId}
            onSelectBus={(id) => setSelectedBusId(id)}
            onDivertBus={(id) => divertBus(id)}
          />
        </div>

        {/* Sidebar Telemetry Control Panel */}
        <div className="lg:col-span-4 flex flex-col h-full glass-card rounded-2xl border border-white/10 overflow-hidden">
          
          {/* Header & Controls */}
            <div className="p-3 border-b border-slate-200/80 space-y-2.5 shrink-0 bg-white/45">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-[#00F2FE]" />
                <span>REAL-TIME FLEET TELEMETRY</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {filteredBuses.length} / {totalFleet} Vehicles
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bus ID, number, stop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/75 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
              {['ALL', 'OVERLOAD', 'DIVERTED', 'ROUTE_9', 'ROUTE_12'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                    filterStatus === status
                      ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bus Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredBuses.map((bus) => {
              const isSelected = selectedBusId === bus.id;
              const isOverloaded = bus.status === 'CRITICAL_OVERLOAD' || bus.status === 'OVERLOAD';
              const isDiverted = bus.isDiverted;

              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`glass-card-hover rounded-xl p-3 border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-50/80 shadow-lg shadow-cyan-900/10'
                      : 'border-slate-200/70 bg-white/45'
                  }`}
                >
                  {/* Card Title Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-xs">{bus.id}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({bus.busNumber})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isOverloaded
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                          : isDiverted
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isDiverted ? 'EXPRESS 9X' : bus.status}
                    </span>
                  </div>

                  {/* Route & Stop */}
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span className="truncate max-w-[170px] text-gray-400 flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-cyan-400 inline shrink-0" />
                      <span>{bus.currentStop}</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{bus.speedKmph} km/h</span>
                  </div>

                  {/* PLF Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-gray-400">Load Factor (PLF)</span>
                      <span className={`font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
                        {bus.currentPassengers}/{bus.capacity} pax ({bus.plfPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded
                            ? 'bg-gradient-to-r from-red-500 to-rose-400'
                            : isDiverted
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, bus.plfPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Row */}
                  {!bus.isDiverted && bus.routeId === 'ROUTE_12' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        divertBus(bus.id);
                      }}
                      className="w-full mt-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-mono font-bold text-[11px] border border-amber-500/40 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>DISPATCH TO ROUTE 9 EXPRESS</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Fleet sizing and low-rush bus optimization */}
      <FleetOptimizationMonitor />

      {/* AFCS Real-Time Ticketing & Station Rush Monitor */}
      <StationTicketingMonitor />

    </div>
  );
}
