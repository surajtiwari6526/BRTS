'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '../../context/SimulationContext';
import { StationTicketingMonitor } from '../../components/Analytics/StationTicketingMonitor';
import { FleetOptimizationMonitor } from '../../components/Analytics/FleetOptimizationMonitor';
import { FleetStatusOverview } from '../../components/Analytics/FleetStatusOverview';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { TransitImpactPanel } from '../../components/Analytics/TransitImpactPanel';
import { ScenarioLab } from '../../components/Analytics/ScenarioLab';

const BusMap = dynamic(() => import('../../components/Map/BusMap').then((mod) => mod.BusMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-800 font-mono text-sm rounded-2xl border border-slate-200">
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-bold">LOADING REAL-TIME TELEMETRY MAP...</span>
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
        <div className="glass-card rounded-2xl p-3.5 border border-slate-200 bg-white flex items-center space-x-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0F172A] border border-slate-300">
            <BusIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">ACTIVE FLEET</div>
            <div className="text-lg font-black font-mono text-[#0F172A]">{totalFleet} Buses</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-3.5 border border-red-200 bg-red-50/50 flex items-center space-x-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 border border-red-300">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-red-800 font-mono font-bold uppercase">OVERLOADED BUSES</div>
            <div className="text-lg font-black font-mono text-red-700">{overloadedCount} (Route 9)</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-3.5 border border-orange-200 bg-orange-50/50 flex items-center space-x-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 border border-orange-300">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-orange-800 font-mono font-bold uppercase">ACTIVE DIVERSIONS</div>
            <div className="text-lg font-black font-mono text-orange-800">{divertedCount} Express 9X</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-3.5 border border-emerald-200 bg-emerald-50/50 flex items-center space-x-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-800 font-mono font-bold uppercase">AVG FLEET PLF RATE</div>
            <div className="text-lg font-black font-mono text-emerald-800">{avgPlf}%</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card rounded-2xl p-3.5 border border-slate-200 bg-white flex items-center space-x-3 col-span-2 md:col-span-1 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-300">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">DPR RECOMMENDATION</div>
            <div className="text-xs font-black font-mono text-[#0F172A]">
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
        <div className="lg:col-span-8 h-full relative overflow-hidden rounded-2xl border border-slate-200">
          <BusMap
            buses={buses}
            selectedBusId={selectedBusId}
            onSelectBus={(id) => setSelectedBusId(id)}
            onDivertBus={(id) => divertBus(id)}
          />
        </div>

        {/* Sidebar Telemetry Control Panel */}
        <div className="lg:col-span-4 flex flex-col h-full glass-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          
          {/* Header & Controls */}
          <div className="p-3 border-b border-slate-200 space-y-2.5 shrink-0 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0F172A] tracking-wider flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-orange-600" />
                <span>REAL-TIME FLEET TELEMETRY</span>
              </span>
              <span className="text-[10px] font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {filteredBuses.length} / {totalFleet} Vehicles
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bus ID, number, stop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 font-bold placeholder-slate-400 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
              {['ALL', 'OVERLOAD', 'DIVERTED', 'ROUTE_9', 'ROUTE_12'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 font-bold ${
                    filterStatus === status
                      ? 'bg-[#EA580C] text-white border border-orange-600 font-black shadow-brts-saffron'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bus Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
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
                      ? 'border-orange-500 bg-white shadow-md shadow-orange-500/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Card Title Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-[#0F172A] text-xs">{bus.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">({bus.busNumber})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isOverloaded
                          ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                          : isDiverted
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isDiverted ? 'EXPRESS 9X' : bus.status}
                    </span>
                  </div>

                  {/* Route & Stop */}
                  <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                    <span className="truncate max-w-[170px] text-slate-800 font-semibold flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-orange-600 inline shrink-0" />
                      <span>{bus.currentStop}</span>
                    </span>
                    <span className="font-mono text-[#0F172A] font-bold">{bus.speedKmph} km/h</span>
                  </div>

                  {/* PLF Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500 font-semibold">Load Factor (PLF)</span>
                      <span className={`font-bold ${isOverloaded ? 'text-red-700' : 'text-slate-800'}`}>
                        {bus.currentPassengers}/{bus.capacity} pax ({bus.plfPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded
                            ? 'bg-gradient-to-r from-red-600 to-red-500'
                            : isDiverted
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-500'
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
                      className="w-full mt-1 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-600 text-orange-800 hover:text-white font-mono font-bold text-[11px] border border-orange-300 transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
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

      {/* Comprehensive BRTS Fleet & Location Overview */}
      <FleetStatusOverview />

      {/* Fleet sizing and low-rush bus optimization */}
      <FleetOptimizationMonitor />

      {/* AFCS Real-Time Ticketing & Station Rush Monitor */}
      <StationTicketingMonitor />

    </div>
  );
}
