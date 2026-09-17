'use client';

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  Flame, 
  Zap, 
  PieChart as PieChartIcon 
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#0A0D14] p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              ROUTE ANALYTICS & FINANCIAL HEATMAP STUDIO
            </h1>
            <p className="text-xs text-gray-400">
              Corridor Throughput, Financial ROI Engine, & Origin-Destination Flow Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            NET SAVINGS: +₹{dprMetrics.netBenefitRupees}/hr
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            DPR RATIO: {dprMetrics.dprRatio}x
          </div>
        </div>
      </div>

      {/* Top 2 Recharts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Hourly Passenger Load Factor Curves */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>HOURLY PASSENGER LOAD FACTOR (PLF %)</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">Peak vs Reroute Corridor</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRoute9" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3366" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRoute12" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0D14', borderColor: '#00F2FE', borderRadius: '12px', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="route9Plf" name="Route 9 (Overload)" stroke="#FF3366" fillOpacity={1} fill="url(#colorRoute9)" />
                <Area type="monotone" dataKey="route12Plf" name="Route 12 (Underutilized)" stroke="#00E676" fillOpacity={1} fill="url(#colorRoute12)" />
                <Area type="monotone" dataKey="expressPlf" name="Route 9X Express (Diverted)" stroke="#7C4DFF" fillOpacity={1} fill="url(#colorExpress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial ROI Breakdown Bar Chart */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>FINANCIAL ROI & DEADHEAD FUEL BREAKDOWN</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300">INR (₹) Impact</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#64748B" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0D14', borderColor: '#00E676', borderRadius: '12px', color: '#FFF' }}
                  formatter={(value) => [`₹${value}`, 'Amount']}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom 2 Panels: Segment Congestion Heatmap Matrix & OD Traffic Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heatmap Matrix */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <Flame className="h-4 w-4 text-red-400" />
              <span>SEGMENT CONGESTION INDEX HEATMAP</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">Station Corridor Surge</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                  <th className="py-2 px-2">STATION NAME</th>
                  <th className="py-2 px-2">ROUTE 9 DENSITY</th>
                  <th className="py-2 px-2">ROUTE 12 DENSITY</th>
                  <th className="py-2 px-2">SEGMENT PLF %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {heatmapData.map((row) => (
                  <tr key={row.station} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2 font-bold text-white">{row.station}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        row.route9Status === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : row.route9Status === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {row.route9Status}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        row.route12Status === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {row.route12Status}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${row.plf > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {row.plf}%
                        </span>
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.plf > 100 ? 'bg-red-500' : 'bg-emerald-400'}`}
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
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>ORIGIN-DESTINATION (OD) PASSENGER MATRIX</span>
            </span>
            <span className="text-[10px] font-mono text-purple-300">Hourly Commuter Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                  <th className="py-2 px-3">ORIGIN BRTS HUB</th>
                  <th className="py-2 px-3">DEST: LD COLLEGE</th>
                  <th className="py-2 px-3">DEST: MANINAGAR</th>
                  <th className="py-2 px-3">TOTAL SURGE PAX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {odMatrix.map((od) => (
                  <tr key={od.origin} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{od.origin}</td>
                    <td className="py-3 px-3 font-bold text-red-400 bg-red-500/5">{od.ldCollege} pax</td>
                    <td className="py-3 px-3 text-emerald-400 bg-emerald-500/5">{od.maninagar} pax</td>
                    <td className="py-3 px-3 font-black text-cyan-300">{od.total} pax</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300">
            💡 OD Flow Insight: 83.4% of passengers originating at RTO Circle & Ranip bound for LD College corridor during 08:00 - 11:00 AM rush hours.
          </div>
        </div>

      </div>

    </div>
  );
}
