'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Bus as BusIcon, 
  Play, 
  MapPin, 
  Gauge, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ParkingCircle
} from 'lucide-react';

export function FleetStatusOverview() {
  const { buses } = useSimulation();
  const [activeTab, setActiveTab] = useState<'ALL' | 'RUNNING' | 'PARKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1) Total No. of Buses
  const totalBuses = buses.length;

  // 2) Running Buses (speed > 0 km/h)
  const runningBuses = buses.filter(b => b.speedKmph > 0);
  const totalRunning = runningBuses.length;

  // 3) Parked Buses (speed === 0 or stationary at depot/terminal)
  // We classify buses with speed === 0 or marked as low-speed parked at terminal as parked
  const parkedBuses = buses.map((bus, idx) => {
    // For realistic simulation demonstration, if speed is 0 or if deterministic index % 5 === 0, mark as parked at terminal depot
    const isParked = bus.speedKmph === 0 || (idx % 5 === 0 && !bus.isDiverted);
    const depotLocation = bus.currentStop.includes('Depot') || bus.currentStop.includes('Terminal')
      ? bus.currentStop
      : `${bus.currentStop} Terminal Depot`;

    return {
      ...bus,
      isParked,
      depotLocation,
      effectiveSpeed: isParked ? 0 : bus.speedKmph,
      parkedStatus: idx % 2 === 0 ? 'Off-Peak Standby' : 'Routine Maintenance Check'
    };
  });

  const actualParkedList = parkedBuses.filter(b => b.isParked);
  const actualRunningList = parkedBuses.filter(b => !b.isParked);
  const totalParked = actualParkedList.length;

  // Filtered List based on Tab & Search
  const displayList = (activeTab === 'RUNNING' 
    ? actualRunningList 
    : activeTab === 'PARKED' 
    ? actualParkedList 
    : parkedBuses
  ).filter(bus => {
    const term = searchQuery.toLowerCase();
    return bus.id.toLowerCase().includes(term) ||
           bus.busNumber.toLowerCase().includes(term) ||
           bus.routeName.toLowerCase().includes(term) ||
           bus.currentStop.toLowerCase().includes(term) ||
           bus.depotLocation.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      
      {/* 3 Major KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1) Total No. Buses in BRTS */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              1) TOTAL FLEET BUSES
            </span>
            <div className="text-3xl font-black font-mono text-white">
              {totalBuses} <span className="text-sm font-normal text-gray-400">Buses</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">Total registered Janmarg BRTS fleet</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
            <BusIcon className="h-7 w-7" />
          </div>
        </div>

        {/* 2) Running Buses */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              2) RUNNING BUSES
            </span>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {actualRunningList.length} <span className="text-sm font-normal text-gray-400">Active</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">Currently moving on live corridors</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
        </div>

        {/* 3) Parked Buses with Location */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
              3) PARKED BUSES (WITH LOCATION)
            </span>
            <div className="text-3xl font-black font-mono text-amber-300">
              {totalParked} <span className="text-sm font-normal text-gray-400">Parked</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">Stationed at terminal depots & yards</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <ParkingCircle className="h-7 w-7" />
          </div>
        </div>

      </div>

      {/* Main Bus Directory Section */}
      <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
        
        {/* Controls Bar: Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl transition-all font-bold ${
                activeTab === 'ALL'
                  ? 'bg-cyan-400 text-black shadow-glow-cyan'
                  : 'bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              ALL BUSES ({totalBuses})
            </button>
            <button
              onClick={() => setActiveTab('RUNNING')}
              className={`px-4 py-2 rounded-xl transition-all font-bold flex items-center space-x-1.5 ${
                activeTab === 'RUNNING'
                  ? 'bg-emerald-400 text-black shadow-glow-green'
                  : 'bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>RUNNING ({actualRunningList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PARKED')}
              className={`px-4 py-2 rounded-xl transition-all font-bold flex items-center space-x-1.5 ${
                activeTab === 'PARKED'
                  ? 'bg-amber-400 text-black shadow-glow-amber'
                  : 'bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              <ParkingCircle className="h-3.5 w-3.5" />
              <span>PARKED ({totalParked})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 font-mono">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search Bus ID, Reg No, Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#0a192f] pl-9 pr-3 py-2 text-xs text-white font-bold placeholder-slate-300 border border-white/30 focus:border-cyan-400 focus:outline-none"
            />
          </div>

        </div>

        {/* Detailed Bus Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/20 text-slate-200 font-bold text-[11px] uppercase">
                <th className="py-3 px-3">BUS ID</th>
                <th className="py-3 px-3">BUS NUMBER / REG</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">ASSIGNED ROUTE</th>
                <th className="py-3 px-3">CURRENT / PARKED LOCATION</th>
                <th className="py-3 px-3">SPEED</th>
                <th className="py-3 px-3">PASSENGER LOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {displayList.map((bus) => (
                <tr key={bus.id} className="hover:bg-white/10 transition-colors">
                  
                  {/* Bus ID */}
                  <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                    <BusIcon className={`h-4 w-4 ${bus.isParked ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <span>{bus.id}</span>
                  </td>

                  {/* Bus Number */}
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    {bus.busNumber}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    {bus.isParked ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400 inline-flex items-center space-x-1">
                        <ParkingCircle className="h-3 w-3" />
                        <span>PARKED ({bus.parkedStatus})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400 inline-flex items-center space-x-1">
                        <Activity className="h-3 w-3 animate-pulse" />
                        <span>RUNNING ({bus.status})</span>
                      </span>
                    )}
                  </td>

                  {/* Route */}
                  <td className="py-3 px-3 text-slate-100 font-semibold max-w-[180px] truncate" title={bus.routeName}>
                    {bus.isDiverted ? (
                      <span className="text-amber-300 font-bold">Route 9 Express (Diverted)</span>
                    ) : (
                      bus.routeName
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-3 text-white font-bold">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${bus.isParked ? 'text-amber-400' : 'text-cyan-400'}`} />
                      <span className="font-bold">{bus.isParked ? bus.depotLocation : bus.currentStop}</span>
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-3 font-bold">
                    {bus.isParked ? (
                      <span className="text-slate-300 font-bold">0 km/h (Parked)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">{bus.effectiveSpeed} km/h</span>
                    )}
                  </td>

                  {/* Passengers / PLF */}
                  <td className="py-3 px-3">
                    {bus.isParked ? (
                      <span className="text-slate-300 font-bold">0 / {bus.capacity} (0%)</span>
                    ) : (
                      <div className="space-y-1 max-w-[120px]">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-200 font-semibold">{bus.currentPassengers}/{bus.capacity} pax</span>
                          <span className="text-cyan-300 font-bold">{bus.plfPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/20">
                          <div
                            className={`h-full rounded-full ${
                              bus.plfPercent > 100 ? 'bg-red-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, bus.plfPercent)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
