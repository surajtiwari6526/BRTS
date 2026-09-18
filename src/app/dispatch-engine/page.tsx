'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useSimulation } from '../../context/SimulationContext';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { TransitImpactPanel } from '../../components/Analytics/TransitImpactPanel';
import { DivertedBusesPanel } from '../../components/Analytics/DivertedBusesPanel';
import { CustomDiversionForm } from '../../components/Dispatch/CustomDiversionForm';
import { ScenarioLab } from '../../components/Analytics/ScenarioLab';
import { 
  Cpu, 
  ArrowRightLeft, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Users, 
  Sliders, 
  FileText,
  Activity,
  Layers,
  BrainCircuit,
  Database,
  Play,
  CheckCircle
} from 'lucide-react';

type TrainingRow = Record<string, unknown>;

export default function DispatchEnginePage() {
  const { buses, autoDivertEmptyBuses, divertBus, dprMetrics, updateDPRParams, dispatchLogs, recommendation, localModel, trainLocalModel, impactMetrics } = useSimulation();

  const [wSavedInput, setWSavedInput] = useState<number>(dprMetrics.wSavedMin);
  const [fuelCostInput, setFuelCostInput] = useState<number>(dprMetrics.cDeadheadRupees);
  const [trainingRows, setTrainingRows] = useState<TrainingRow[]>([]);
  const [trainingFileName, setTrainingFileName] = useState<string>('');
  const [uploadMessage, setUploadMessage] = useState<string>('Upload a CSV or Excel sheet with route and passenger/load columns.');

  // Corridor A: Route 9 metrics
  const route9Buses = buses.filter(b => b.routeId === 'ROUTE_9');
  const route9AvgPlf = (route9Buses.reduce((acc, b) => acc + b.plfPercent, 0) / (route9Buses.length || 1)).toFixed(1);

  // Corridor B: Route 12 metrics
  const route12Buses = buses.filter(b => b.routeId === 'ROUTE_12');
  const route12AvgPlf = (route12Buses.reduce((acc, b) => acc + b.plfPercent, 0) / (route12Buses.length || 1)).toFixed(1);

  // Diverted buses count
  const divertedBuses = buses.filter(b => b.isDiverted);

  const handleSliderChange = (w: number, c: number) => {
    setWSavedInput(w);
    setFuelCostInput(c);
    updateDPRParams(w, c);
  };

  const handleTrainingFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<TrainingRow>(firstSheet, { defval: '' });
      const validRows = rows.filter((row) => {
        const keys = Object.keys(row).map((key) => key.toLowerCase().replace(/\s+/g, ''));
        const hasRoute = keys.some((key) => key === 'route' || key === 'routeid' || key === 'corridor');
        const hasLoadSignal = keys.some((key) => key === 'passengers' || key === 'currentpassengers' || key === 'plf' || key === 'plfpercent' || key === 'waitingpassengers');
        return hasRoute && hasLoadSignal;
      });

      setTrainingFileName(file.name);
      setTrainingRows(validRows);
      setUploadMessage(validRows.length
        ? `${validRows.length} usable rows loaded from ${file.name}.`
        : 'No usable rows found. Add route plus passengers, PLF, or waiting passengers columns.');
    } catch {
      setTrainingFileName('');
      setTrainingRows([]);
      setUploadMessage('Could not read this file. Use a valid CSV or Excel workbook.');
    }
    event.target.value = '';
  };

  const downloadTrainingTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { timestamp: '2026-09-17 08:30', routeId: 'ROUTE_9', station: 'RTO Circle', passengers: 76, capacity: 70, waitingPassengers: 42, weatherFactor: 1.2 },
      { timestamp: '2026-09-17 08:30', routeId: 'ROUTE_12', station: 'Nehrunagar Circle', passengers: 18, capacity: 70, waitingPassengers: 12, weatherFactor: 1.2 }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'training-data');
    XLSX.writeFile(workbook, 'brts-training-template.xlsx');
  };

  const qualityScore = trainingRows.length === 0 ? 0 : Math.min(100, Math.round((trainingRows.length / Math.max(1, trainingRows.length + 2)) * 100));
  const uploadedRouteCount = new Set(trainingRows.map((row) => {
    const entry = Object.entries(row).find(([key]) => ['route', 'routeid', 'corridor'].includes(key.toLowerCase().replace(/\s+/g, '')));
    return String(entry?.[1] || 'UNKNOWN');
  })).size;
  const numericValue = (row: TrainingRow, names: string[]) => {
    const match = Object.entries(row).find(([key]) => names.includes(key.toLowerCase().replace(/\s+/g, '')));
    const value = Number(match?.[1]);
    return Number.isFinite(value) ? value : null;
  };
  const uploadedLoadValue = (row: TrainingRow) => {
    const directLoad = numericValue(row, ['plf', 'plfpercent', 'loadfactor']);
    if (directLoad !== null) return directLoad;
    const passengers = numericValue(row, ['passengers', 'currentpassengers']);
    const capacity = numericValue(row, ['capacity', 'seats']);
    return passengers !== null && capacity !== null && capacity > 0 ? (passengers / capacity) * 100 : null;
  };
  const averageUploadedLoad = trainingRows.length
    ? Math.round(trainingRows.reduce((sum, row) => sum + (uploadedLoadValue(row) ?? 0), 0) / trainingRows.length)
    : 0;
  const uploadedOverloadRows = trainingRows.filter((row) => (uploadedLoadValue(row) ?? 0) > 100).length;
  const uploadedMissingSignals = trainingRows.filter((row) => numericValue(row, ['passengers', 'currentpassengers', 'plf', 'plfpercent', 'waitingpassengers']) === null).length;
  const uploadedInsight = trainingRows.length === 0
    ? 'Upload historical operations data to generate a route-level training insight.'
    : uploadedOverloadRows > 0
      ? `${uploadedOverloadRows} uploaded records exceed 100% load. Prioritize surge handling before reducing service.`
      : `Average uploaded load is ${averageUploadedLoad}%. The imported sample does not show an overload signal.`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Dispatch matrix header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-200 bg-white shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-700">
              <Cpu className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold font-mono text-[#0F172A] tracking-wide">
                DISPATCH & DIVERSION BALANCER STUDIO
              </h1>
              <p className="text-xs text-slate-600 font-semibold">
                Autonomous Corridor Load Balancer & Dynamic Rerouting Optimization Engine
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Auto Divert Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={autoDivertEmptyBuses}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-mono font-black text-xs tracking-wider hover:brightness-110 shadow-brts-saffron transition-all transform active:scale-95 flex items-center space-x-2 border border-orange-500"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>APPROVE DYNAMIC DIVERSION (2 EMPTY BUSES)</span>
          </button>
        </div>
      </div>

      <CustomDiversionForm />
      <DivertedBusesPanel />
      <RouteReferencePanel />
      <TransitImpactPanel />
      <ScenarioLab />

      {/* Live recommendation and local training controls */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-700 border border-orange-200">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700">AI-assisted recommendation</span>
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-mono text-orange-800 font-bold">LIVE</span>
                </div>
                <h2 className="mt-1 text-base font-bold text-[#0F172A]">{recommendation.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{recommendation.rationale}</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold ${
              recommendation.priority === 'HIGH' ? 'border-red-300 bg-red-50 text-red-800' :
              recommendation.priority === 'MEDIUM' ? 'border-orange-300 bg-orange-50 text-orange-800' :
              'border-emerald-300 bg-emerald-50 text-emerald-800'
            }`}>
              {recommendation.priority} · {recommendation.confidence}%
            </span>
          </div>
          {recommendation.recommendedBusId && (
            <button
              onClick={() => divertBus(recommendation.recommendedBusId as string, 'ROUTE_9_EXPRESS')}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-700 shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Apply recommendation: {recommendation.action}
            </button>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800 border border-amber-200">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">Local model training</span>
              <h2 className="mt-1 text-base font-bold text-[#0F172A]">Train with current transit data</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
            <span>Records <strong className="text-slate-900">{localModel.trainingExamples}</strong></span>
            <span>Features <strong className="text-slate-900">{localModel.featureCount}</strong></span>
            <span>Version <strong className="text-slate-900">{localModel.version}</strong></span>
            <span>Status <strong className={localModel.status === 'TRAINING' ? 'text-orange-700' : 'text-emerald-700'}>{localModel.status}</strong></span>
          </div>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 px-3 py-2 text-xs font-bold text-orange-900 transition hover:bg-orange-100">
                <Database className="h-3.5 w-3.5" />
                Add CSV / Excel data
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleTrainingFile} className="sr-only" />
              </label>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>Data quality <strong className={qualityScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}>{qualityScore || '--'}%</strong></span>
                <span>Routes <strong className="text-slate-900">{uploadedRouteCount || '--'}</strong></span>
              </div>
              {trainingRows.length > 0 && (
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-[10px] font-mono text-slate-700">
                  <span>Avg PLF <strong className="block text-slate-900">{averageUploadedLoad || '--'}%</strong></span>
                  <span>Overload <strong className="block text-red-700">{uploadedOverloadRows}</strong></span>
                  <span>Missing <strong className="block text-orange-700">{uploadedMissingSignals}</strong></span>
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-slate-600">{uploadMessage}</p>
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] leading-relaxed text-emerald-900"><strong>Operational insight:</strong> {uploadedInsight}</p>
              {trainingRows.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-2 text-[10px] font-mono text-slate-700">
                  <div className="mb-1 flex items-center justify-between font-bold text-slate-900"><span>Preview</span><span>{trainingRows.length} accepted rows</span></div>
                  {trainingRows.slice(0, 2).map((row, index) => <div key={index} className="truncate">{Object.values(row).slice(0, 5).join(' · ')}</div>)}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <button onClick={downloadTrainingTemplate} className="text-[10px] font-bold text-orange-700 underline underline-offset-2">Download template</button>
                {trainingFileName && <span className="truncate text-[10px] text-slate-500">{trainingFileName}</span>}
              </div>
            </div>
          <button
            onClick={() => trainLocalModel(trainingRows.length, trainingFileName || 'Built-in BRTS dataset')}
            disabled={localModel.status === 'TRAINING' || trainingRows.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-900 transition hover:bg-orange-100 disabled:cursor-wait disabled:opacity-60"
          >
            {localModel.status === 'TRAINING' ? <Activity className="h-3.5 w-3.5 animate-pulse" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {localModel.status === 'TRAINING' ? 'Training local model...' : trainingRows.length ? 'Train using uploaded data' : 'Upload data to enable training'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-orange-200 bg-orange-50/50 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-800">What-if operations preview</span>
            <h2 className="mt-1 text-base font-bold text-slate-900">Preview the next intervention before dispatching</h2>
          </div>
          <span className="rounded-full border border-orange-200 bg-white px-2 py-1 text-[10px] font-mono text-orange-800 font-bold">No state change</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <input aria-label="Preview additional buses" type="range" min="0" max="3" defaultValue="1" className="w-full accent-orange-600" onChange={(event) => {
            const previewCount = Number(event.target.value);
            const projectedBalance = Math.min(100, impactMetrics.networkBalanceScore + previewCount * 4);
            const projectedSaved = impactMetrics.passengerMinutesSaved + previewCount * dprMetrics.wSavedMin * 40;
            const output = event.currentTarget.parentElement?.nextElementSibling;
            if (output) output.textContent = `${previewCount} extra bus${previewCount === 1 ? '' : 'es'} -> ${Math.round(projectedSaved).toLocaleString()} passenger-min saved, balance ${projectedBalance}/100`;
          }} />
          <strong className="text-sm text-slate-900 font-mono">Test 0-3 buses</strong>
        </div>
        <p className="text-xs font-mono text-slate-700">1 extra bus {'->'} {Math.round(impactMetrics.passengerMinutesSaved + dprMetrics.wSavedMin * 40).toLocaleString()} passenger-min saved, balance {Math.min(100, impactMetrics.networkBalanceScore + 4)}/100</p>
      </div>

      {/* Side-by-Side Corridor Load Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Corridor 1: Route 9 (Congested) */}
        <div className="glass-card rounded-2xl p-6 border border-red-200 space-y-4 bg-red-50/40 shadow-sm">
          <div className="flex items-center justify-between border-b border-red-200 pb-3">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300">
                CRITICAL CONGESTION CORRIDOR
              </span>
              <h2 className="text-lg font-bold font-mono text-[#0F172A] mt-1">
                Route 9: RTO Circle → LD College
              </h2>
            </div>
            <span className="text-2xl font-black font-mono text-red-700">{route9AvgPlf}% PLF</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">WAIT TIME</span>
              <span className="text-lg font-bold font-mono text-red-700">24 mins</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">WAITING PAX</span>
              <span className="text-lg font-bold font-mono text-[#0F172A]">{dprMetrics.pWaitingPax} pax</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">BUS COUNT</span>
              <span className="text-lg font-bold font-mono text-red-700">{route9Buses.length} Active</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            High-rush university & tech park corridor experiencing severe commuter bottleneck. PLF exceeds capacity by 12-17%.
          </p>
        </div>

        {/* Corridor 2: Route 12 (Underutilized) */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-200 space-y-4 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                UNDERUTILIZED CAPACITY CORRIDOR
              </span>
              <h2 className="text-lg font-bold font-mono text-[#0F172A] mt-1">
                Route 12: RTO Circle → CTM Cross Road
              </h2>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-700">{route12AvgPlf}% PLF</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">WAIT TIME</span>
              <span className="text-lg font-bold font-mono text-emerald-700">3 mins</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">WAITING PAX</span>
              <span className="text-lg font-bold font-mono text-[#0F172A]">32 pax</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block font-bold">BUS COUNT</span>
              <span className="text-lg font-bold font-mono text-emerald-700">{route12Buses.length} Active</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Heritage & residential corridor running under capacity. Empty seating available for dynamic rerouting to Route 9 Express.
          </p>
        </div>

      </div>

      {/* DPR Formula & Algorithmic Recommendation Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white space-y-6 shadow-sm">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-orange-600">ALGORITHMIC DECISION ENGINE</span>
            <h2 className="text-lg font-bold font-mono text-[#0F172A]">
              Diversion Profitability Ratio (DPR) Model
            </h2>
          </div>

          {/* Dynamic Status Badge */}
          <div className={`px-4 py-2 rounded-xl font-mono text-sm font-bold flex items-center space-x-2 border shadow-2xs ${
            dprMetrics.isRecommended
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>
              {dprMetrics.isRecommended 
                ? `DIVERSION RECOMMENDED: DPR ${dprMetrics.dprRatio}x (Net +₹${dprMetrics.netBenefitRupees}/hr)` 
                : 'MAINTAIN STANDARD SCHEDULE'}
            </span>
          </div>
        </div>

        {/* Mathematical Equation Card */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="text-center font-mono text-lg md:text-xl text-[#0F172A] font-bold bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
            Net Benefit = (W<sub>saved</sub> × P<sub>waiting</sub>) - (C<sub>deadhead</sub> + D<sub>route12_delay</sub>)
          </div>

          {/* Breakdown parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block font-semibold">W<sub>saved</sub> (Time Saved)</span>
              <span className="text-lg font-bold text-emerald-700">{dprMetrics.wSavedMin} mins / pax</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block font-semibold">P<sub>waiting</sub> (Surge Demand)</span>
              <span className="text-lg font-bold text-[#0F172A]">{dprMetrics.pWaitingPax} passengers</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block font-semibold">C<sub>deadhead</sub> (Fuel Cost)</span>
              <span className="text-lg font-bold text-orange-700">₹{dprMetrics.cDeadheadRupees}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block font-semibold">D<sub>route12_delay</sub> (Transfer Cost)</span>
              <span className="text-lg font-bold text-slate-700">₹{dprMetrics.dRoute12DelayRupees}</span>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-orange-700 font-bold">
              <Sliders className="h-4 w-4" />
              <span>TEST SIMULATION PARAMETER SLIDERS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div>
                <label className="text-slate-700 flex justify-between mb-1 font-semibold">
                  <span>Passenger Wait Time Saved (W<sub>saved</sub>):</span>
                  <span className="text-orange-700 font-bold">{wSavedInput} mins</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={wSavedInput}
                  onChange={(e) => handleSliderChange(Number(e.target.value), fuelCostInput)}
                  className="w-full accent-orange-600"
                />
              </div>

              <div>
                <label className="text-slate-700 flex justify-between mb-1 font-semibold">
                  <span>Deadhead Reroute Fuel Cost (C<sub>deadhead</sub>):</span>
                  <span className="text-orange-700 font-bold">₹{fuelCostInput}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={fuelCostInput}
                  onChange={(e) => handleSliderChange(wSavedInput, Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Diverted Vehicles Telemetry Cards & Audit Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diverted Buses Card Panel */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <ArrowRightLeft className="h-4 w-4 text-orange-600" />
              <span>ACTIVE DIVERTED VEHICLES</span>
            </span>
            <span className="text-[10px] font-mono text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-300 font-bold">
              {divertedBuses.length} Buses
            </span>
          </div>

          <div className="space-y-3">
            {divertedBuses.map((bus) => (
              <div key={bus.id} className="p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-900">{bus.id} ({bus.busNumber})</span>
                  <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded">
                    REROUTED 9X
                  </span>
                </div>
                <div className="text-slate-700 text-[11px] font-medium">
                  Target: <span className="text-[#0F172A] font-bold">RTO → LD College Express</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Speed: {bus.speedKmph} km/h</span>
                  <span>Passengers: {bus.currentPassengers}/{bus.capacity}</span>
                </div>
              </div>
            ))}

            {divertedBuses.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No buses currently diverted. Click "Approve Dynamic Diversion" above to reroute BUS-1201 and BUS-1205.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Dispatch Audit Logs Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
              <FileText className="h-4 w-4 text-orange-600" />
              <span>DISPATCH TELEMETRY AUDIT LOG</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">Live Timestamped</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">BUS ID</th>
                  <th className="py-2 px-3">ORIGIN ROUTE</th>
                  <th className="py-2 px-3">TARGET CORRIDOR</th>
                  <th className="py-2 px-3">DPR RATIO</th>
                  <th className="py-2 px-3">NET BENEFIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatchLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-orange-700 font-semibold">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{log.busId}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.sourceRoute}</td>
                    <td className="py-2.5 px-3 text-orange-800 font-semibold">{log.targetRoute}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{log.dpr}x</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">+₹{log.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
