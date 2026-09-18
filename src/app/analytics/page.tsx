'use client';

import React, { useMemo, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { TransitImpactPanel } from '../../components/Analytics/TransitImpactPanel';
import { BRTS_ROUTES } from '../../data/routeCatalog';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  Flame, 
  Zap, 
  PieChart as PieChartIcon,
  Download,
  Search,
  Bus as BusIcon,
  ArrowUpDown,
  Gauge,
  Users,
  ArrowRightLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function AnalyticsPage() {
  const { buses, dprMetrics } = useSimulation();
  const [fleetQuery, setFleetQuery] = useState('');
  const [fleetRoute, setFleetRoute] = useState('ALL');
  const [fleetStatus, setFleetStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'load' | 'speed' | 'route'>('load');

  const fleetRows = useMemo(() => buses
    .filter((bus) => {
      const query = fleetQuery.toLowerCase();
      const matchesQuery = !query || `${bus.id} ${bus.busNumber} ${bus.currentStop} ${bus.routeName}`.toLowerCase().includes(query);
      const matchesRoute = fleetRoute === 'ALL' || bus.routeId === fleetRoute;
      const matchesStatus = fleetStatus === 'ALL' || bus.status === fleetStatus;
      return matchesQuery && matchesRoute && matchesStatus;
    })
    .sort((a, b) => sortBy === 'speed' ? b.speedKmph - a.speedKmph : sortBy === 'route' ? a.routeId.localeCompare(b.routeId) : b.plfPercent - a.plfPercent), [buses, fleetQuery, fleetRoute, fleetStatus, sortBy]);

  const fleetAverageLoad = buses.length ? Math.round(buses.reduce((sum, bus) => sum + bus.plfPercent, 0) / buses.length) : 0;
  const fleetVacantSeats = buses.reduce((sum, bus) => sum + Math.max(0, bus.capacity - bus.currentPassengers), 0);
  const fleetOverloaded = buses.filter((bus) => bus.plfPercent > 100).length;
  const fleetDiverted = buses.filter((bus) => bus.isDiverted).length;
  const routeFleetRows = BRTS_ROUTES.map((route) => {
    const routeBuses = buses.filter((bus) => bus.routeId === `ROUTE_${route.routeNo}`);
    const passengers = routeBuses.reduce((sum, bus) => sum + bus.currentPassengers, 0);
    const averagePlf = routeBuses.length ? Math.round(routeBuses.reduce((sum, bus) => sum + bus.plfPercent, 0) / routeBuses.length) : 0;
    return {
      ...route,
      busCount: routeBuses.length,
      passengers,
      averagePlf,
      overloaded: routeBuses.filter((bus) => bus.plfPercent > 100).length,
      vacantSeats: routeBuses.reduce((sum, bus) => sum + Math.max(0, bus.capacity - bus.currentPassengers), 0),
      diverted: routeBuses.filter((bus) => bus.isDiverted).length
    };
  });
  const fleetMetrics: Array<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }> = [
    { label: 'Fleet average load', value: `${fleetAverageLoad}%`, icon: Gauge },
    { label: 'Vacant seats', value: String(fleetVacantSeats), icon: Users },
    { label: 'Over capacity', value: String(fleetOverloaded), icon: Flame },
    { label: 'Active diversions', value: String(fleetDiverted), icon: ArrowRightLeft }
  ];

  const exportFleetCsv = () => {
    const header = ['Bus ID', 'Registration', 'Route', 'Current stop', 'Passengers', 'Capacity', 'PLF %', 'Status', 'Speed km/h', 'Diverted'];
    const rows = buses.map((bus) => [bus.id, bus.busNumber, bus.routeId, bus.currentStop, bus.currentPassengers, bus.capacity, bus.plfPercent, bus.status, bus.speedKmph, bus.isDiverted ? 'Yes' : 'No']);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'brts-live-fleet.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Hourly Passenger Load Curves Data
  const hourlyData = [
    { hour: '06:00', route9Plf: 42, route12Plf: 12, expressPlf: 15 },
    { hour: '08:00', route9Plf: 95, route12Plf: 18, expressPlf: 45 },
    { hour: '09:00', route9Plf: 117, route12Plf: 22, expressPlf: 82 },
    { hour: '10:00', route9Plf: 112, route12Plf: 20, expressPlf: 88 },
    { hour: '12:00', route9Plf: 75, route12Plf: 15, expressPlf: 40 },
    { hour: '14:00', route9Plf: 68, route12Plf: 14, expressPlf: 35 },
    { hour: '17:00', route9Plf: 122, route12Plf: 24, expressPlf: 94 },
    { hour: '19:00', route9Plf: 108, route12Plf: 19, expressPlf: 78 },
    { hour: '21:00', route9Plf: 54, route12Plf: 10, expressPlf: 25 },
  ];

  // Financial Breakdown Data
  const financialData = [
    { category: 'Deadhead Fuel Cost', cost: dprMetrics.cDeadheadRupees, fill: '#FFB300' },
    { category: 'Route 12 Delay Cost', cost: dprMetrics.dRoute12DelayRupees, fill: '#7C4DFF' },
    { category: 'Wait Time Saved Value', cost: dprMetrics.wSavedMin * dprMetrics.pWaitingPax * 2.5, fill: '#00E676' },
    { category: 'Net Economic Benefit', cost: dprMetrics.netBenefitRupees, fill: '#00F2FE' },
  ];

  // Segment Congestion Heatmap Matrix Data
  const heatmapData = [
    { station: 'RTO Circle', route9Status: 'HIGH', route12Status: 'LOW', plf: 88 },
    { station: 'Ranip BRTS', route9Status: 'HIGH', route12Status: 'LOW', plf: 94 },
    { station: 'Jaimangal', route9Status: 'CRITICAL', route12Status: 'LOW', plf: 105 },
    { station: 'Gujarat University', route9Status: 'CRITICAL', route12Status: 'NONE', plf: 115 },
    { station: 'LD College', route9Status: 'CRITICAL', route12Status: 'NONE', plf: 118 },
    { station: 'Nehrunagar Circle', route9Status: 'MEDIUM', route12Status: 'LOW', plf: 45 },
    { station: 'Anjali Cross Road', route9Status: 'NONE', route12Status: 'LOW', plf: 22 },
    { station: 'Maninagar', route9Status: 'NONE', route12Status: 'LOW', plf: 28 },
    { station: 'CTM Cross Road', route9Status: 'NONE', route12Status: 'LOW', plf: 18 },
  ];

  // OD Matrix Data
  const odMatrix = [
    { origin: 'RTO Circle', ldCollege: 412, maninagar: 82, total: 494 },
    { origin: 'Ranip BRTS', ldCollege: 380, maninagar: 45, total: 425 },
    { origin: 'Nehrunagar', ldCollege: 290, maninagar: 110, total: 400 },
    { origin: 'Anjali Cross', ldCollege: 180, maninagar: 140, total: 320 },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3.5 rounded-xl bg-orange-100 border border-orange-200 text-orange-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-[#0F172A] tracking-wide">
              ROUTE ANALYTICS & FINANCIAL HEATMAP STUDIO
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Corridor Throughput, Financial ROI Engine, & Origin-Destination Flow Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold">
            NET SAVINGS: +₹{dprMetrics.netBenefitRupees}/hr
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-900 font-bold">
            DPR RATIO: {dprMetrics.dprRatio}x
          </div>
        </div>
      </div>

      <RouteReferencePanel compact />
      <TransitImpactPanel compact />

      {/* Live fleet intelligence */}
      <section className="glass-card rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#0F172A]/10 p-2.5 text-[#0F172A] border border-[#0F172A]/20"><BusIcon className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">LIVE FLEET INTELLIGENCE</h2>
              <p className="text-xs text-slate-500 font-medium">Every vehicle, current location, load state, and dispatch assignment.</p>
            </div>
          </div>
          <button onClick={exportFleetCsv} className="flex items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800 hover:bg-orange-100 shadow-2xs"><Download className="h-3.5 w-3.5" /> Export fleet CSV</button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {fleetMetrics.map(({ label, value, icon: MetricIcon }) => {
            return <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 font-bold"><span>{label}</span><MetricIcon className="h-3.5 w-3.5 text-orange-600" /></div><strong className="mt-1 block text-xl font-mono text-[#0F172A]">{value}</strong></div>;
          })}
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={fleetQuery} onChange={(event) => setFleetQuery(event.target.value)} placeholder="Search bus, registration, stop..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-orange-500 font-medium" /></label>
          <select value={fleetRoute} onChange={(event) => setFleetRoute(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-semibold"><option value="ALL">All routes</option>{BRTS_ROUTES.map((route) => <option key={route.routeNo} value={`ROUTE_${route.routeNo}`}>Route {route.routeNo} · {route.routeName}</option>)}</select>
          <select value={fleetStatus} onChange={(event) => setFleetStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-semibold"><option value="ALL">All statuses</option><option value="CRITICAL_OVERLOAD">Critical overload</option><option value="OVERLOAD">Overload</option><option value="NEAR_CAPACITY">Near capacity</option><option value="LOW_RUSH">Low rush</option><option value="UNDERUTILIZED">Underutilized</option></select>
          <button onClick={() => setSortBy(sortBy === 'load' ? 'speed' : sortBy === 'speed' ? 'route' : 'load')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"><ArrowUpDown className="h-3.5 w-3.5" /> Sort: {sortBy}</button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold"><tr><th className="px-3 py-2">Bus</th><th className="px-3 py-2">Route</th><th className="px-3 py-2">Current stop</th><th className="px-3 py-2">Passengers</th><th className="px-3 py-2">PLF</th><th className="px-3 py-2">Speed</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Assignment</th></tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">{fleetRows.map((bus) => <tr key={bus.id} className="hover:bg-orange-50/60"><td className="px-3 py-3"><strong className="font-mono text-[#0F172A]">{bus.id}</strong><span className="block text-[10px] text-slate-500 font-medium">{bus.busNumber}</span></td><td className="px-3 py-3 font-mono font-bold text-slate-700">{bus.routeId}</td><td className="px-3 py-3 text-slate-800 font-medium">{bus.currentStop}</td><td className="px-3 py-3 font-mono font-semibold">{bus.currentPassengers} / {bus.capacity}</td><td className="px-3 py-3"><span className={`font-mono font-bold ${bus.plfPercent > 100 ? 'text-red-700' : bus.plfPercent < 35 ? 'text-emerald-700' : 'text-[#0F172A]'}`}>{bus.plfPercent}%</span><div className="mt-1 h-1 w-20 rounded-full bg-slate-200"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, bus.plfPercent)}%` }} /></div></td><td className="px-3 py-3 font-mono text-slate-700">{bus.speedKmph} km/h</td><td className="px-3 py-3"><span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{bus.status.replace('_', ' ')}</span></td><td className="px-3 py-3 text-[10px] font-semibold text-slate-600">{bus.isDiverted ? `Diverted to ${bus.divertedTo}` : 'Scheduled route'}</td></tr>)}</tbody>
          </table>
          {fleetRows.length === 0 && <div className="p-6 text-center text-xs text-slate-500">No buses match the selected filters.</div>}
        </div>
        <p className="text-[10px] font-mono text-slate-500 font-medium">Showing {fleetRows.length} of {buses.length} live vehicles. Data refreshes with the simulation telemetry loop.</p>
      </section>

      {/* Complete network route fleet overview */}
      <section className="glass-card rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">COMPLETE NETWORK FLEET COVERAGE</h2>
            <p className="text-xs text-slate-500 font-medium">Live allocation across every route in the supplied Ahmedabad BRTS schedule.</p>
          </div>
          <span className="rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-[10px] font-mono font-bold text-orange-800">{routeFleetRows.filter((route) => route.busCount > 0).length}/{routeFleetRows.length} routes active</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold"><tr><th className="px-3 py-2">Route</th><th className="px-3 py-2">Published corridor</th><th className="px-3 py-2">Buses</th><th className="px-3 py-2">Passengers</th><th className="px-3 py-2">Avg PLF</th><th className="px-3 py-2">Vacant seats</th><th className="px-3 py-2">Overload</th><th className="px-3 py-2">Diverted</th></tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">{routeFleetRows.map((route) => <tr key={route.routeNo} className="hover:bg-orange-50/60"><td className="px-3 py-2.5 font-mono font-bold text-[#0F172A]">{route.routeNo}</td><td className="px-3 py-2.5 text-slate-800 font-medium">{route.routeName}<span className="block text-[10px] text-slate-500">{route.totalStops} stops · Rs {route.minFareInr}-{route.maxFareInr}</span></td><td className="px-3 py-2.5 font-mono font-bold">{route.busCount}</td><td className="px-3 py-2.5 font-mono">{route.passengers}</td><td className={`px-3 py-2.5 font-mono font-bold ${route.averagePlf > 100 ? 'text-red-700' : route.averagePlf < 35 ? 'text-emerald-700' : 'text-[#0F172A]'}`}>{route.averagePlf}%</td><td className="px-3 py-2.5 font-mono">{route.vacantSeats}</td><td className="px-3 py-2.5 font-mono text-red-700 font-bold">{route.overloaded}</td><td className="px-3 py-2.5 font-mono text-emerald-700 font-bold">{route.diverted}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      {/* Top 2 Recharts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Hourly Passenger Load Factor Curves */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span>HOURLY PASSENGER LOAD FACTOR (PLF %)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">Peak vs Reroute Corridor</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRoute9" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRoute12" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="route9Plf" name="Route 9 (Overload)" stroke="#DC2626" fillOpacity={1} fill="url(#colorRoute9)" />
                <Area type="monotone" dataKey="route12Plf" name="Route 12 (Underutilized)" stroke="#059669" fillOpacity={1} fill="url(#colorRoute12)" />
                <Area type="monotone" dataKey="expressPlf" name="Route 9X Express (Diverted)" stroke="#EA580C" fillOpacity={1} fill="url(#colorExpress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial ROI Breakdown Bar Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <DollarSign className="h-4 w-4 text-emerald-700" />
              <span>FINANCIAL ROI & DEADHEAD FUEL BREAKDOWN</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">INR (₹) Impact</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" stroke="#64748B" tick={{ fontSize: 9, fill: '#475569' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Amount']}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]} fill="#EA580C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom 2 Panels: Segment Congestion Heatmap Matrix & OD Traffic Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heatmap Matrix */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <Flame className="h-4 w-4 text-red-600" />
              <span>SEGMENT CONGESTION INDEX HEATMAP</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">Station Corridor Surge</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold">
                  <th className="py-2 px-2">STATION NAME</th>
                  <th className="py-2 px-2">ROUTE 9 DENSITY</th>
                  <th className="py-2 px-2">ROUTE 12 DENSITY</th>
                  <th className="py-2 px-2">SEGMENT PLF %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {heatmapData.map((row) => (
                  <tr key={row.station} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-2 font-bold text-[#0F172A]">{row.station}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        row.route9Status === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : row.route9Status === 'HIGH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.route9Status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        row.route12Status === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.route12Status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${row.plf > 100 ? 'text-red-700' : 'text-emerald-700'}`}>
                          {row.plf}%
                        </span>
                        <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.plf > 100 ? 'bg-red-600' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, row.plf)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Origin-Destination (OD) Traffic Flow Matrix */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-orange-600" />
              <span>ORIGIN-DESTINATION (OD) PASSENGER MATRIX</span>
            </span>
            <span className="text-[10px] font-mono text-orange-800 font-bold">Hourly Commuter Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold">
                  <th className="py-2 px-3">ORIGIN BRTS HUB</th>
                  <th className="py-2 px-3">DEST: LD COLLEGE</th>
                  <th className="py-2 px-3">DEST: MANINAGAR</th>
                  <th className="py-2 px-3">TOTAL SURGE PAX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {odMatrix.map((od) => (
                  <tr key={od.origin} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0F172A]">{od.origin}</td>
                    <td className="py-3 px-3 font-bold text-red-800 bg-red-50">{od.ldCollege} pax</td>
                    <td className="py-3 px-3 text-emerald-800 bg-emerald-50 font-semibold">{od.maninagar} pax</td>
                    <td className="py-3 px-3 font-black text-orange-900">{od.total} pax</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs font-mono text-orange-900 font-semibold">
            💡 OD Flow Insight: 83.4% of passengers originating at RTO Circle & Ranip bound for LD College corridor during 08:00 - 11:00 AM rush hours.
          </div>
        </div>

      </div>

    </div>
  );
}
