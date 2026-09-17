'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Smartphone, 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  Ticket, 
  Sparkles, 
  Check, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  Zap,
  Info
} from 'lucide-react';

export default function CommuterPage() {
  const { buses } = useSimulation();

  const [origin, setOrigin] = useState<string>('RTO Circle BRTS');
  const [destination, setDestination] = useState<string>('LD Engineering College');
  const [selectedOption, setSelectedOption] = useState<'FASTEST' | 'COMFORT' | null>('COMFORT');
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Derive dynamic rush status from live buses
  const route9Overloaded = buses.filter(b => b.routeId === 'ROUTE_9' && (b.status === 'CRITICAL_OVERLOAD' || b.status === 'OVERLOAD')).length > 0;
  const expressBusesActive = buses.filter(b => b.isDiverted).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0A0D14] p-4 lg:p-8">
      
      {/* Container Frame simulating modern passenger smartphone interface */}
      <div className="w-full max-w-md glass-card rounded-[2.5rem] border border-white/15 p-6 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Phone Notch & Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold text-white block">BRTS Commuter Pulse</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live AI Dynamic Fares</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 font-bold">
            Ahmedabad BRTS
          </span>
        </div>

        {/* Origin & Destination Search Form */}
        <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-3">
          
          <div className="relative flex items-center space-x-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
              <div className="h-6 w-0.5 bg-white/20" />
              <div className="h-3 w-3 rounded-full bg-purple-400" />
            </div>

            <div className="flex-1 space-y-2 text-xs font-mono">
              <div>
                <label className="text-[9px] text-gray-400 uppercase font-bold block">ORIGIN STATION</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#0A0D14] text-white rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-cyan-400 outline-none"
                >
                  <option value="RTO Circle BRTS">RTO Circle BRTS Station</option>
                  <option value="Ranip BRTS">Ranip BRTS Station</option>
                  <option value="Nehrunagar Circle">Nehrunagar Circle Station</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-gray-400 uppercase font-bold block">DESTINATION</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#0A0D14] text-white rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-cyan-400 outline-none"
                >
                  <option value="LD Engineering College">LD Engineering College</option>
                  <option value="Gujarat University">Gujarat University</option>
                  <option value="Maninagar Railway Station">Maninagar Station</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Live Route Choices Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>RECOMMENDED JOURNEY OPTIONS</span>
            <span className="text-cyan-400 text-[10px]">Real-Time PLF Sensing</span>
          </div>

          {/* Option A: Fastest Route */}
          <div
            onClick={() => setSelectedOption('FASTEST')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
              selectedOption === 'FASTEST'
                ? 'border-red-500/60 bg-red-950/20 shadow-glow-red'
                : 'border-white/10 bg-[#111622]/60 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  OPTION A: FASTEST
                </span>
                {route9Overloaded && (
                  <span className="text-[10px] text-red-300 font-mono font-bold animate-pulse">
                    ⚠️ SEVERE CROWD
                  </span>
                )}
              </div>
              <span className="text-base font-bold font-mono text-white">₹15</span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-gray-300">
              <span className="font-bold text-white flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-red-400" />
                <span>18 Mins Direct (Route 9)</span>
              </span>
              <span className="text-red-400 font-bold">98% Rush (Standing Room Only)</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-tight">
              Direct corridor. High overcrowding during peak hours. Next bus arriving in 2 mins.
            </p>
          </div>

          {/* Option B: Comfort Route (Dynamic Discount & Guaranteed Seat) */}
          <div
            onClick={() => setSelectedOption('COMFORT')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative overflow-hidden ${
              selectedOption === 'COMFORT'
                ? 'border-emerald-500/60 bg-emerald-950/20 shadow-glow-green'
                : 'border-white/10 bg-[#111622]/60 hover:border-white/20'
            }`}
          >
            <div className="absolute -right-6 -top-6 h-16 w-16 bg-emerald-500/10 rounded-full blur-lg" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>OPTION B: COMFORT CHOICE</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  33% DYNAMIC DISCOUNT
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 line-through mr-1 font-mono">₹15</span>
                <span className="text-base font-bold font-mono text-emerald-400">₹10</span>
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-gray-300">
              <span className="font-bold text-white flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>22 Mins (Route 12 + Express 9X)</span>
              </span>
              <span className="text-emerald-400 font-bold">15% Rush (Guaranteed Seat)</span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <Zap className="h-3 w-3" />
                <span>AI REROUTE BENEFIT:</span>
              </div>
              <p>
                Board Route 12 underutilized bus → Seamless transfer at Nehrunagar Circle onto active Express 9X rerouted bus with guaranteed seating.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button: Book Dynamic Digital Ticket */}
        <button
          onClick={() => setShowTicketModal(true)}
          disabled={!selectedOption}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-mono font-black text-sm tracking-wider shadow-glow-cyan hover:brightness-110 transition-all flex items-center justify-center space-x-2"
        >
          <Ticket className="h-5 w-5" />
          <span>BOOK DYNAMIC QR TICKET ({selectedOption === 'COMFORT' ? '₹10' : '₹15'})</span>
        </button>

      </div>

      {/* Dynamic Digital QR Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-cyan-500/40 p-6 space-y-4 text-center shadow-glow-cyan relative">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-mono text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>DYNAMIC DIGITAL TRANSIT PASS</span>
              </span>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white text-black space-y-2 mx-auto inline-block">
              <div className="flex justify-center">
                <QrCode className="h-36 w-36 text-slate-900" />
              </div>
              <p className="font-mono text-[10px] text-gray-600 font-bold tracking-widest">
                TICKET ID: BRTS-2026-9X-{Math.floor(1000 + Math.random() * 9000)}
              </p>
            </div>

            <div className="text-xs font-mono space-y-1">
              <div className="text-white font-bold text-sm">
                {origin} → {destination}
              </div>
              <div className="text-emerald-400 font-semibold">
                {selectedOption === 'COMFORT' ? 'Comfort Option (Guaranteed Seat - 33% Off)' : 'Fastest Direct Option'}
              </div>
              <div className="text-gray-400 text-[10px]">
                Valid for 1 Trip across Janmarg BRTS Corridors
              </div>
            </div>

            <button
              onClick={() => setShowTicketModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs hover:bg-cyan-500/30"
            >
              DONE / BACK TO SIMULATOR
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
