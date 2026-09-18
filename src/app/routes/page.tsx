'use client';

import React, { useState } from 'react';
import { Calculator, Map, Search, Route as RouteIcon, CircleDot } from 'lucide-react';
import { BRTS_ROUTES, FARE_SLABS, fareForDistance } from '../../data/routeCatalog';

export default function RoutesPage() {
  const [query, setQuery] = useState('');
  const [distance, setDistance] = useState(8);

  const filteredRoutes = BRTS_ROUTES.filter((route) => {
    const searchable = `${route.routeNo} ${route.routeName} ${route.startPoint} ${route.endPoint} ${route.intermediateStops.join(' ')}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  });
  const selectedFare = fareForDistance(distance);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 p-4 lg:p-8">
      <section className="glass-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-700">
              <RouteIcon className="h-4 w-4 text-orange-600" /> Route reference
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Ahmedabad BRTS routes and fares</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 font-medium">All route definitions, stop counts, intermediate landmarks, and fare limits from the supplied route schedules.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search route, stop, or landmark" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-orange-500 font-medium" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="glass-card rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#0F172A]">Route directory</h2>
              <p className="text-xs text-slate-500 font-semibold">{filteredRoutes.length} of {BRTS_ROUTES.length} routes</p>
            </div>
            <Map className="h-5 w-5 text-orange-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                <tr><th className="px-3 py-2">Route</th><th className="px-3 py-2">Corridor</th><th className="px-3 py-2">Stops</th><th className="px-3 py-2">Key intermediate stops</th><th className="px-3 py-2">Fare range</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRoutes.map((route) => (
                  <tr key={route.routeNo} className="transition hover:bg-orange-50/60">
                    <td className="px-3 py-3 align-top"><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-orange-100 px-2 font-mono font-bold text-orange-900 border border-orange-200">{route.routeNo}</span></td>
                    <td className="px-3 py-3 align-top"><div className="font-semibold text-[#0F172A]">{route.routeName}</div><div className="mt-1 text-[11px] text-slate-500 font-medium">{route.startPoint} to {route.endPoint}</div></td>
                    <td className="px-3 py-3 align-top font-mono font-bold text-slate-800">{route.totalStops}</td>
                    <td className="max-w-xs px-3 py-3 align-top leading-relaxed text-slate-600 font-medium">{route.intermediateStops.join(' - ')}</td>
                    <td className="px-3 py-3 align-top font-mono font-bold text-orange-800">Rs {route.minFareInr} - Rs {route.maxFareInr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Calculator className="h-5 w-5 text-orange-600" /><h2 className="font-bold text-[#0F172A]">Distance fare calculator</h2></div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">Journey distance: <span className="font-mono text-orange-700 font-bold">{distance.toFixed(1)} km</span></label>
            <input type="range" min="0" max="25" step="0.1" value={distance} onChange={(event) => setDistance(Number(event.target.value))} className="w-full accent-orange-600" />
            <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-4"><div className="text-xs text-slate-500 font-semibold">Applicable slab</div><div className="mt-1 text-lg font-bold text-[#0F172A]">Rs {selectedFare.fareInr}</div><div className="text-xs font-mono text-orange-800 font-bold">{selectedFare.label}</div></div>
          </section>
          <section className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-[#0F172A]">Fare slabs</h2>
            <div className="space-y-2">{FARE_SLABS.map((slab) => <div key={slab.label} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs"><span className="flex items-center gap-2 text-slate-700 font-medium"><CircleDot className="h-3 w-3 text-orange-600" />{slab.label}</span><strong className="font-mono text-orange-800 font-bold">Rs {slab.fareInr}</strong></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
