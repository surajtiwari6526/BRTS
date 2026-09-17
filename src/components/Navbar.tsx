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
  CheckCircle2,
  Route as RouteIcon
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
    { label: 'Dispatch Studio', href: '/dispatch-engine', icon: Layers },
    { label: 'Commuter Simulator', href: '/commuter', icon: Smartphone },
    { label: 'Driver Cockpit HUD', href: '/driver-hud', icon: ShieldAlert },
    { label: 'Route Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Routes & Fares', href: '/routes', icon: RouteIcon }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 lg:px-8">
        
        {/* Brand */}
        <div className="flex items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-black tracking-wider text-slate-900">
                BRTS<span className="text-[#e87518]">-PULSE</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                OPERATIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-tight">
              Janmarg Ahmedabad Autonomous Transit System
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/command-center') || (pathname === '/dashboard' && item.href === '/command-center') || (pathname === '/dispatch' && item.href === '/dispatch-engine') || (pathname === '/driver' && item.href === '/driver-hud');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#163b64] text-white border border-[#163b64] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#f28c28]' : 'text-slate-400'}`} />
                <span className="hidden 2xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Weather Widget */}
          <div className="hidden lg:flex items-center space-x-2 rounded-xl bg-white/70 px-3 py-1.5 border border-slate-200 text-xs text-slate-600">
            <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <span className="font-mono text-slate-700 font-medium">32°C Ahmedabad</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              Demand x{weatherFactor}
            </span>
          </div>

          {/* Clock & WebSocket status */}
          <div className="flex items-center space-x-2 rounded-xl bg-white/70 px-3 py-1.5 border border-slate-200 text-xs">
            <button
              onClick={toggleSimulation}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition-colors"
              title="Toggle Live Telemetry Simulation Loop"
            >
              <Radio className={`h-4 w-4 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
              <span className="font-mono text-[11px] hidden sm:inline">
                {isSimulating ? 'SIMULATION LIVE (2.5s)' : 'PAUSED'}
              </span>
            </button>
            <span className="h-3 w-px bg-slate-200" />
            <span className="font-mono text-[#163b64] font-bold text-[11px]">{timeString}</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSimulation}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 border border-slate-200 text-slate-500 hover:text-[#e87518] hover:border-orange-300 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Reroute Alert Toast Banner */}
      {lastAlert && (
        <div className="bg-gradient-to-r from-orange-100 via-slate-100 to-orange-100 border-y border-orange-300 px-4 py-1.5 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center space-x-2 text-orange-800 font-mono font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />
            <span>DISPATCH TELEMETRY: {lastAlert}</span>
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
