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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
        
        {/* Bus Selector for Driver Terminal */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700">
            <BusIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-500 font-bold">DRIVER TERMINAL ID:</span>
              <select
                value={selectedDriverBusId}
                onChange={(e) => {
                  setSelectedDriverBusId(e.target.value);
                  setShowRerouteModal(true);
                }}
                className="bg-slate-100 text-[#0F172A] font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-200 outline-none"
              >
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.busNumber})</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-semibold">
              Janmarg Autonomous Vehicle HUD v4.1
            </p>
          </div>
        </div>

        {/* Dynamic Route Status Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestChime}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-mono text-xs font-bold border border-orange-200 flex items-center space-x-1.5 shadow-2xs"
          >
            <Volume2 className="h-4 w-4" />
            <span>TEST REROUTE ALERT CHIME</span>
          </button>

          <span className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border flex items-center space-x-2 ${
            isDiverted
              ? 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
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
        <div className="glass-card rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-center space-y-3 bg-white shadow-sm">
          <span className="text-xs font-mono text-slate-500 tracking-wider font-bold uppercase flex items-center space-x-1.5">
            <Gauge className="h-4 w-4 text-orange-600" />
            <span>TELEMETRY SPEEDOMETER</span>
          </span>

          <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-slate-200 bg-slate-50 shadow-inner">
            <div className="text-center space-y-0">
              <span className="text-5xl font-black font-mono text-[#0F172A] block tracking-tighter">
                {currentBus.speedKmph}
              </span>
              <span className="text-xs font-mono text-orange-600 font-bold">KM/H</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span>SPEED LIMIT: 45 KM/H (OPTIMAL)</span>
          </div>
        </div>

        {/* Capacity & PLF Meter Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-mono text-slate-500 tracking-wider font-bold uppercase flex items-center space-x-1.5">
              <Users className="h-4 w-4 text-orange-600" />
              <span>PASSENGER CAPACITY METER</span>
            </span>
            <span className="text-xs font-mono text-[#0F172A] font-bold">
              {currentBus.currentPassengers} / {currentBus.capacity} SEATS
            </span>
          </div>

          <div className="space-y-3 text-center my-auto">
            <div className="text-4xl font-black font-mono text-[#0F172A]">
              {currentBus.plfPercent}% PLF
            </div>

            <div className="h-4 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentBus.plfPercent > 100
                    ? 'bg-gradient-to-r from-red-600 to-red-500'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, currentBus.plfPercent)}%` }}
              />
            </div>

            <div className="text-xs font-mono text-slate-700">
              {currentBus.plfPercent < 30 ? (
                <span className="text-emerald-700 font-bold">UNDERUTILIZED — READY FOR PASSENGER INFLOW</span>
              ) : currentBus.plfPercent > 100 ? (
                <span className="text-red-700 font-bold">OVERLOADED — NO STANDING SPACE</span>
              ) : (
                <span className="text-slate-800 font-bold">NORMAL COMMUTER CAPACITY</span>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 font-bold border-t border-slate-200 pt-2 flex justify-between">
            <span>SEATS FILLED: {currentBus.currentPassengers}</span>
            <span>VACANT: {Math.max(0, currentBus.capacity - currentBus.currentPassengers)}</span>
          </div>
        </div>

        {/* Next Stop Navigation Card */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-200 flex flex-col justify-between space-y-4 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="text-xs font-mono text-slate-500 tracking-wider font-bold uppercase flex items-center space-x-1.5">
              <Navigation className="h-4 w-4 text-emerald-700" />
              <span>NEXT STOP NAVIGATION</span>
            </span>
            <span className="text-xs font-mono text-emerald-800 font-bold">ETA: 2 MINS</span>
          </div>

          <div className="space-y-2 text-center my-auto">
            <span className="text-xs text-slate-500 font-mono block uppercase font-bold">APPROACHING JUNCTION</span>
            <div className="text-2xl font-black font-mono text-[#0F172A]">
              {currentBus.currentStop}
            </div>
            <div className="text-xs font-mono text-slate-600 font-medium">
              Heading: <span className="text-[#0F172A] font-bold">{currentBus.heading}°</span> | Distance: <span className="text-[#0F172A] font-bold">420m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs font-mono text-slate-700 flex items-center justify-between shadow-2xs">
            <span className="font-semibold">CORRIDOR: {isDiverted ? 'Express 9X' : currentBus.routeId}</span>
            <span className="text-emerald-700 font-bold">CLEAR LANE</span>
          </div>
        </div>

      </div>

      {/* Emergency Audio/Visual Dynamic Reroute Alert Modal */}
      {showRerouteModal && !isDiverted && currentBus.routeId === 'ROUTE_12' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xl glass-card rounded-3xl border-2 border-orange-500 p-8 space-y-6 shadow-xl relative bg-white">
            
            {/* Alert Header */}
            <div className="flex items-center justify-between border-b border-orange-200 pb-4">
              <div className="flex items-center space-x-3 text-orange-700">
                <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center animate-bounce">
                  <ShieldAlert className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <h2 className="text-lg font-black font-mono text-[#0F172A] tracking-wider">
                    EMERGENCY REROUTE DISPATCH ALERT
                  </h2>
                  <p className="text-xs text-orange-700 font-mono font-bold">
                    Traffic Operations Center Dynamic Directive
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-600 text-white animate-pulse">
                PRIORITY HIGH
              </span>
            </div>

            {/* Alert Body Text */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-3 font-mono text-sm">
              <p className="text-orange-900 font-bold text-base leading-snug">
                "Reroute Authorized: Divert to Route 9X Express at Next Junction (Nehrunagar Circle)."
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-orange-200">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">REASON</span>
                  <span className="text-[#0F172A] font-bold">Route 9 Passenger Overload Surge</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">EXPECTED DEMAND</span>
                  <span className="text-emerald-700 font-bold">+35 Waiting Passengers</span>
                </div>
              </div>
            </div>

            {/* Accept / Acknowledge Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRerouteModal(false)}
                className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs border border-slate-300"
              >
                DISMISS / SNOOZE (30s)
              </button>

              <button
                onClick={handleAcceptReroute}
                className="py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-mono font-black text-xs tracking-wider shadow-brts-saffron hover:brightness-110 transition-all flex items-center justify-center space-x-2 border border-orange-500"
              >
                <CheckCircle2 className="h-5 w-5 fill-white text-orange-600" />
                <span>ACKNOWLEDGE & ACCEPT REROUTE</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
