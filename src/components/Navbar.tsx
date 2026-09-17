'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Layers, 
  Smartphone, 
  ShieldAlert, 
  BarChart3, 
  Sun, 
  Radio, 
  RotateCcw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isSimulating, toggleSimulation, resetSimulation, lastAlert, clearAlert, weatherFactor } = useSimulation();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: 'Command Center', href: '/command-center', icon: Activity },
    { label: 'AI Dispatch Studio', href: '/dispatch-engine', icon: Layers },
    { label: 'Commuter Simulator', href: '/commuter', icon: Smartphone },
    { label: 'Driver Cockpit HUD', href: '/driver-hud', icon: ShieldAlert },
    { label: 'Route Analytics', href: '/analytics', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0D14]/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-glow-cyan">
            <Zap className="h-6 w-6 text-black" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-black tracking-wider text-white">
                BRTS<span className="text-[#00F2FE]">-PULSE</span>
              </span>
              <span className="rounded-full bg-[#00F2FE]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00F2FE] border border-[#00F2FE]/30">
                v2.4 AI DISPATCH
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-tight">
              Janmarg Ahmedabad Autonomous Transit System
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-2xl bg-[#111622] p-1.5 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/command-center') || (pathname === '/dashboard' && item.href === '/command-center') || (pathname === '/dispatch' && item.href === '/dispatch-engine') || (pathname === '/driver' && item.href === '/driver-hud');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-glow-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#00F2FE]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Weather Widget */}
          <div className="hidden lg:flex items-center space-x-2 rounded-xl bg-[#111622] px-3 py-1.5 border border-white/5 text-xs text-gray-300">
            <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <span className="font-mono text-white font-medium">32°C Ahmedabad</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              Demand x{weatherFactor}
            </span>
          </div>

          {/* Clock & WebSocket status */}
          <div className="flex items-center space-x-2 rounded-xl bg-[#111622] px-3 py-1.5 border border-white/10 text-xs">
            <button
              onClick={toggleSimulation}
              className="flex items-center space-x-1.5 text-gray-300 hover:text-white transition-colors"
              title="Toggle Live Telemetry Simulation Loop"
            >
              <Radio className={`h-4 w-4 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
              <span className="font-mono text-[11px] hidden sm:inline">
                {isSimulating ? 'SIMULATION LIVE (2.5s)' : 'PAUSED'}
              </span>
            </button>
            <span className="h-3 w-px bg-white/20" />
            <span className="font-mono text-cyan-300 font-bold text-[11px]">{timeString}</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSimulation}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111622] border border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/40 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Reroute Alert Toast Banner */}
      {lastAlert && (
        <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border-y border-amber-500/40 px-4 py-1.5 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center space-x-2 text-amber-300 font-mono font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />
            <span>AI DISPATCH TELEMETRY: {lastAlert}</span>
          </div>
          <button 
            onClick={clearAlert}
            className="text-gray-400 hover:text-white text-[10px] underline font-mono"
          >
            DISMISS
          </button>
        </div>
      )}
    </header>
  );
};
