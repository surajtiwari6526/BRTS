'use client';

import React from 'react';
import { FleetStatusOverview } from '../../components/Analytics/FleetStatusOverview';
import { Bus as BusIcon, ShieldCheck } from 'lucide-react';

export default function FleetOverviewPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Page Header */}
      <section className="glass-card rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-800 border border-orange-300 shadow-2xs">
            <BusIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-orange-900 tracking-wider uppercase">
                COMPLETE JANMARG BRTS FLEET DIRECTORY
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                LIVE TELEMETRY SENSING
              </span>
            </div>
            <h1 className="text-2xl font-black font-mono text-[#0F172A] tracking-wide mt-1">
              FLEET & BUS LOCATION DIRECTORY
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl font-medium">
              Complete operational overview of all Janmarg BRTS buses, including registration bus numbers, active running status, and parked buses with exact depot/terminal locations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Bus Directory Section */}
      <FleetStatusOverview />

    </div>
  );
}
