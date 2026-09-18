'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Route as RouteIcon } from 'lucide-react';
import { BRTS_ROUTES } from '../../data/routeCatalog';

const referenceRoutes = ['3', '12'];

export const RouteReferencePanel: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const routes = referenceRoutes.map((routeNo) => BRTS_ROUTES.find((route) => route.routeNo === routeNo)).filter(Boolean);

  return (
    <section className={`glass-card rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-orange-600" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-900">Official network reference</span>
        </div>
        <Link href="/routes" className="flex items-center gap-1 text-[10px] font-semibold text-orange-700 hover:text-orange-900">All routes <ArrowUpRight className="h-3 w-3" /></Link>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {routes.map((route) => route && (
          <div key={route.routeNo} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2"><span className="rounded-md bg-orange-100 px-2 py-1 font-mono text-xs font-bold text-orange-900 border border-orange-200">Route {route.routeNo}</span><span className="font-mono text-[10px] font-bold text-orange-800">Rs {route.minFareInr}-{route.maxFareInr}</span></div>
            <div className="mt-2 text-xs font-bold text-[#0F172A]">{route.routeName}</div>
            <div className="mt-1 text-[10px] text-slate-500 font-medium">{route.totalStops} stops · via {route.intermediateStops.slice(0, 3).join(', ')}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
