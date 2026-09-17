'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Ticket, Users, TrendingUp, AlertTriangle, CheckCircle, Zap, Building2, Filter, DollarSign } from 'lucide-react';
import { RushLevel } from '../../types/brts';

export const StationTicketingMonitor: React.FC = () => {
  const { stops, routeTicketingSummaries, totalTicketsSold, totalRevenueRupees } = useSimulation();
  const [filter, setFilter] = useState<'ALL' | 'SURGE' | 'LOW'>('ALL');

  const filteredStops = stops.filter((stop) => {
    if (filter === 'SURGE') return stop.rushLevel === 'CRITICAL_SURGE' || stop.rushLevel === 'HIGH_RUSH';
    if (filter === 'LOW') return stop.rushLevel === 'LOW_RUSH';
    return true;
  });

  const getRushBadge = (rush?: RushLevel) => {
    switch (rush) {
      case 'CRITICAL_SURGE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span>CRITICAL SURGE</span>
          </span>
        );
      case 'HIGH_RUSH':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>HIGH RUSH</span>
          </span>
        );
      case 'MODERATE_RUSH':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
            <span>MODERATE RUSH</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <span>LOW RUSH (CLEAR)</span>
          </span>
        );
    }
  };

  const route9Summary = routeTicketingSummaries.find(r => r.routeId === 'ROUTE_9');
  const route12Summary = routeTicketingSummaries.find(r => r.routeId === 'ROUTE_12');

  const r9Tickets = route9Summary?.totalTicketsSold || 0;
  const r12Tickets = route12Summary?.totalTicketsSold || 0;
  const r9Pct = totalTicketsSold ? Math.round((r9Tickets / totalTicketsSold) * 100) : 65;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-300 bg-slate-50/45 space-y-6">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-mono text-white tracking-wider flex items-center space-x-2">
              <span>AFCS REAL-TIME TICKETING & STATION RUSH ANALYTICS</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Janmarg Automated Fare Collection System (AFCS) Live Telemetry & Passenger Turnstile Rush Meter
            </p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center space-x-1 bg-white/70 p-1 rounded-xl border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filter === 'ALL' ? 'bg-cyan-500 text-black shadow-glow-cyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            ALL STATIONS ({stops.length})
          </button>
          <button
            onClick={() => setFilter('SURGE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filter === 'SURGE' ? 'bg-red-500 text-white shadow-glow-red' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔴 HIGH RUSH SURGE
          </button>
          <button
            onClick={() => setFilter('LOW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filter === 'LOW' ? 'bg-emerald-500 text-black shadow-glow-emerald' : 'text-gray-400 hover:text-white'
            }`}
          >
            🟢 LOW RUSH
          </button>
        </div>
      </div>

      {/* Top 4 Real-time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Tickets */}
          <div className="p-4 rounded-2xl bg-white/5 border border-slate-300 bg-slate-50/45 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>TOTAL TICKETS SOLD (1HR)</span>
            <Ticket className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {totalTicketsSold.toLocaleString()} <span className="text-xs font-normal text-gray-400">Passes</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>+14.2% Surge vs previous hour</span>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
          <div className="p-4 rounded-2xl bg-white/5 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>AFCS FARE REVENUE</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ₹{totalRevenueRupees.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-gray-400">
            Flat Rate ₹15 / Ticket (QR + Smart Card)
          </div>
        </div>

        {/* KPI 3: Route 9 Ticket Surge */}
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-red-300">
            <span>CORRIDOR 9 DEMAND</span>
            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400">
            {r9Tickets.toLocaleString()} <span className="text-xs font-normal text-red-300">({r9Pct}%)</span>
          </div>
          <div className="text-[10px] font-mono text-red-300 font-bold">
            🔴 CRITICAL PASSENGER SURGE
          </div>
        </div>

        {/* KPI 4: Route 12 Surplus */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
            <span>CORRIDOR 12 DEMAND</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {r12Tickets.toLocaleString()} <span className="text-xs font-normal text-emerald-300">({100 - r9Pct}%)</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-300 font-bold">
            🟢 LOW RUSH — READY FOR REROUTE
          </div>
        </div>

      </div>

      {/* Visual Route Ticket Demand Balance Bar */}
      <div className="p-4 rounded-2xl bg-white/65 border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-red-400 font-bold flex items-center space-x-1.5">
            <span>Route 9 (RTO ➔ LD College): {r9Tickets} Tickets ({r9Pct}%)</span>
          </span>
          <span className="text-emerald-400 font-bold">
            Route 12 (RTO ➔ CTM): {r12Tickets} Tickets ({100 - r9Pct}%)
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500"
            style={{ width: `${r9Pct}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${100 - r9Pct}%` }}
          />
        </div>

        <p className="text-[10px] text-gray-400 font-mono text-center">
                  Dispatch Recommendation: Dynamic diversion from Corridor 12 to Corridor 9 will absorb {Math.round(r9Tickets * 0.35)} tickets/hr surge.
        </p>
      </div>

      {/* BRTS Station Rush & Ticketing Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span className="font-bold text-white uppercase flex items-center space-x-1.5">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <span>LIVE BRTS STATIONS TELEMETRY & TURNSTILE RUSH</span>
          </span>
          <span>Showing {filteredStops.length} of {stops.length} stations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStops.map((stop) => (
            <div
              key={stop.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                stop.rushLevel === 'CRITICAL_SURGE'
                  ? 'bg-gradient-to-br from-red-950/40 to-[#0A0D14] border-red-500/40 hover:border-red-400'
                  : stop.rushLevel === 'HIGH_RUSH'
                  ? 'bg-gradient-to-br from-amber-950/30 to-[#0A0D14] border-amber-500/30 hover:border-amber-400'
                  : stop.rushLevel === 'MODERATE_RUSH'
                  ? 'bg-gradient-to-br from-purple-950/30 to-[#0A0D14] border-purple-500/30'
                  : 'bg-gradient-to-br from-emerald-950/20 to-[#0A0D14] border-emerald-500/20'
              }`}
            >
              {/* Station Name & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-mono font-bold text-white text-sm flex items-center space-x-1">
                    <span>{stop.name}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    ID: {stop.id} | {stop.routeId === 'SHARED' ? 'Hub (RTO)' : stop.routeId}
                  </span>
                </div>
                {getRushBadge(stop.rushLevel)}
              </div>

              {/* Ticketing Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white/65 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-gray-400 block text-[9px]">TICKETS SOLD (1HR)</span>
                  <span className="text-cyan-300 font-black text-sm">{stop.ticketsSoldLastHour || 120}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">WAITING AT TURNSTILE</span>
                  <span className={`font-black text-sm ${stop.waitingPassengers && stop.waitingPassengers > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stop.waitingPassengers || 15} Pax
                  </span>
                </div>
              </div>

              {/* Live Rush Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>Turnstile Capacity Usage</span>
                  <span className="font-bold text-white">
                    {Math.min(100, Math.round(((stop.waitingPassengers || 15) / 120) * 100))}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stop.rushLevel === 'CRITICAL_SURGE'
                        ? 'bg-red-500'
                        : stop.rushLevel === 'HIGH_RUSH'
                        ? 'bg-amber-400'
                        : stop.rushLevel === 'MODERATE_RUSH'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(((stop.waitingPassengers || 15) / 120) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
