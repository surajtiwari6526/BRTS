'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { 
  ShieldAlert, 
  Gauge, 
  Users, 
  MapPin, 
  ArrowRightLeft, 
  Volume2, 
  CheckCircle2, 
  Zap, 
  Navigation,
  Radio,
  Bus as BusIcon
} from 'lucide-react';

export default function DriverHudPage() {
  const { buses, divertBus, triggerAudioChime } = useSimulation();
  const [selectedDriverBusId, setSelectedDriverBusId] = useState<string>('BUS-1201');
  const [showRerouteModal, setShowRerouteModal] = useState<boolean>(true);

  const currentBus = buses.find(b => b.id === selectedDriverBusId) || buses[0];
  const isDiverted = currentBus.isDiverted;

  const handleAcceptReroute = () => {
    divertBus(currentBus.id, 'ROUTE_9_EXPRESS');
    setShowRerouteModal(false);
  };

  const handleTestChime = () => {
    triggerAudioChime();
    setShowRerouteModal(true);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8 space-y-6 select-none">
      
      {/* HUD Top Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-4 border border-white/10">
        
        {/* Bus Selector for Driver Terminal */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <BusIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gray-400">DRIVER TERMINAL ID:</span>
              <select
                value={selectedDriverBusId}
                onChange={(e) => {
                  setSelectedDriverBusId(e.target.value);
                  setShowRerouteModal(true);
                }}
                className="bg-white/80 text-[#163b64] font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-200 outline-none"
              >
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.busNumber})</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Janmarg Autonomous Vehicle HUD v4.1
            </p>
          </div>
        </div>

        {/* Dynamic Route Status Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestChime}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30 flex items-center space-x-1.5"
          >
            <Volume2 className="h-4 w-4" />
            <span>TEST REROUTE ALERT CHIME</span>
          </button>

          <span className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border flex items-center space-x-2 ${
            isDiverted
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-glow-amber animate-pulse'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            <Radio className="h-4 w-4" />
            <span>CURRENT ASSIGNMENT: {isDiverted ? 'EXPRESS 9X REROUTE' : currentBus.routeId}</span>
          </span>
        </div>

      </div>

      <RouteReferencePanel compact />

      {/* Driver HUD High-Visibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* Speedometer Gauge Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-300 flex flex-col items-center justify-center space-y-3 bg-white/45">
          <span className="text-xs font-mono text-gray-400 tracking-wider font-bold uppercase flex items-center space-x-1.5">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span>TELEMETRY SPEEDOMETER</span>
          </span>

          <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-[#163b64]/30 bg-slate-100/80 shadow-lg">
            <div className="text-center space-y-0">
              <span className="text-5xl font-black font-mono text-white block tracking-tighter">
                {currentBus.speedKmph}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">KM/H</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            <span>SPEED LIMIT: 45 KM/H (OPTIMAL)</span>
          </div>
        </div>

        {/* Capacity & PLF Meter Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-300 flex flex-col justify-between space-y-4 bg-white/45">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono text-gray-400 tracking-wider font-bold uppercase flex items-center space-x-1.5">
              <Users className="h-4 w-4 text-purple-400" />
              <span>PASSENGER CAPACITY METER</span>
            </span>
            <span className="text-xs font-mono text-purple-300 font-bold">
              {currentBus.currentPassengers} / {currentBus.capacity} SEATS
            </span>
          </div>

          <div className="space-y-3 text-center my-auto">
            <div className="text-4xl font-black font-mono text-white">
              {currentBus.plfPercent}% PLF
            </div>

            <div className="h-4 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentBus.plfPercent > 100
                    ? 'bg-gradient-to-r from-red-500 to-rose-400'
                    : 'bg-gradient-to-r from-purple-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, currentBus.plfPercent)}%` }}
              />
            </div>

            <div className="text-xs font-mono text-gray-300">
              {currentBus.plfPercent < 30 ? (
                <span className="text-emerald-400 font-bold">UNDERUTILIZED — READY FOR PASSENGER INFLOW</span>
              ) : currentBus.plfPercent > 100 ? (
                <span className="text-red-400 font-bold">OVERLOADED — NO STANDING SPACE</span>
              ) : (
                <span className="text-cyan-300 font-bold">NORMAL COMMUTER CAPACITY</span>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-gray-400 border-t border-white/10 pt-2 flex justify-between">
            <span>SEATS FILLED: {currentBus.currentPassengers}</span>
            <span>VACANT: {Math.max(0, currentBus.capacity - currentBus.currentPassengers)}</span>
          </div>
        </div>

        {/* Next Stop Navigation Card */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-300/60 flex flex-col justify-between space-y-4 bg-emerald-50/45">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono text-gray-400 tracking-wider font-bold uppercase flex items-center space-x-1.5">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span>NEXT STOP NAVIGATION</span>
            </span>
            <span className="text-xs font-mono text-emerald-300 font-bold">ETA: 2 MINS</span>
          </div>

          <div className="space-y-2 text-center my-auto">
            <span className="text-xs text-gray-400 font-mono block uppercase">APPROACHING JUNCTION</span>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {currentBus.currentStop}
            </div>
            <div className="text-xs font-mono text-gray-300">
              Heading: <span className="text-white font-bold">{currentBus.heading}°</span> | Distance: <span className="text-white font-bold">420m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center justify-between">
            <span>CORRIDOR: {isDiverted ? 'Express 9X' : currentBus.routeId}</span>
            <span className="text-emerald-400 font-bold">CLEAR LANE</span>
          </div>
        </div>

      </div>

      {/* Emergency Audio/Visual Dynamic Reroute Alert Modal */}
      {showRerouteModal && !isDiverted && currentBus.routeId === 'ROUTE_12' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-xl glass-card rounded-3xl border-2 border-amber-500 p-8 space-y-6 shadow-glow-amber relative bg-gradient-to-b from-[#1E1B18] to-[#0A0D14]">
            
            {/* Alert Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <div className="flex items-center space-x-3 text-amber-400">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center animate-bounce">
                  <ShieldAlert className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg font-black font-mono text-white tracking-wider">
                    EMERGENCY REROUTE DISPATCH ALERT
                  </h2>
                  <p className="text-xs text-amber-300 font-mono">
                    Traffic Operations Center Dynamic Directive
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-black animate-pulse">
                PRIORITY HIGH
              </span>
            </div>

            {/* Alert Body Text */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 font-mono text-sm">
              <p className="text-amber-200 font-bold text-base leading-snug">
                "Reroute Authorized: Divert to Route 9X Express at Next Junction (Nehrunagar Circle)."
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 pt-2 border-t border-amber-500/20">
                <div>
                  <span className="text-gray-400 block text-[10px]">REASON</span>
                  <span className="text-white font-bold">Route 9 Passenger Overload Surge</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">EXPECTED DEMAND</span>
                  <span className="text-emerald-400 font-bold">+35 Waiting Passengers</span>
                </div>
              </div>
            </div>

            {/* Accept / Acknowledge Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRerouteModal(false)}
                className="py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-mono font-bold text-xs border border-white/10"
              >
                DISMISS / SNOOZE (30s)
              </button>

              <button
                onClick={handleAcceptReroute}
                className="py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-mono font-black text-xs tracking-wider shadow-glow-amber hover:brightness-110 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="h-5 w-5 fill-black text-amber-400" />
                <span>ACKNOWLEDGE & ACCEPT REROUTE</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
