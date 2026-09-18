'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { BRTS_ROUTES } from '../../data/routeCatalog';
import { AHMEDABAD_STOPS } from '../../data/initialDataset';
import { 
  ArrowRightLeft, 
  Bus as BusIcon, 
  MapPin, 
  CheckSquare, 
  Square, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Navigation
} from 'lucide-react';

const VIA_WAYPOINT_OPTIONS = [
  { id: 'via_ashram', label: 'Via Ashram Road Express Corridor' },
  { id: 'via_panjrapole', label: 'Via Panjrapole Char Rasta' },
  { id: 'via_gulbai', label: 'Via Gulbai Tekra Approach' },
  { id: 'via_shivranjani', label: 'Via Shivranjani Cross Road' },
  { id: 'via_sghighway', label: 'Via SG Highway Bypass Corridor' },
  { id: 'via_delhi_darwaja', label: 'Via Delhi Darwaja / Kalupur' },
  { id: 'via_iskcon', label: 'Via ISKCON Circle' },
  { id: 'via_memnagar', label: 'Via Memnagar Flyover' }
];

export function CustomDiversionForm() {
  const { buses, divertBus } = useSimulation();

  // 1) Route Number (Dropdown)
  const [selectedRouteNo, setSelectedRouteNo] = useState<string>('9');
  
  // 2) Origin Station (Dropdown)
  const [originStation, setOriginStation] = useState<string>('RTO Circle');

  // 3) Drop (Destination Station) (Dropdown)
  const [destinationStation, setDestinationStation] = useState<string>('LD Engineering College');

  // 4) Through Which Way (Checkboxes)
  const [selectedViaWays, setSelectedViaWays] = useState<string[]>([
    'via_panjrapole', 
    'via_gulbai'
  ]);

  // 5) Selected Bus to Divert
  const [selectedBusId, setSelectedBusId] = useState<string>(
    buses.find(b => b.routeId === 'ROUTE_12' && !b.isDiverted)?.id || buses[0]?.id || 'BUS-1201'
  );

  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle via checkbox
  const toggleViaWay = (wayId: string) => {
    setSelectedViaWays(prev => 
      prev.includes(wayId) ? prev.filter(w => w !== wayId) : [...prev, wayId]
    );
  };

  // Submit Diversion Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusId) return;

    const chosenRouteObj = BRTS_ROUTES.find(r => r.routeNo === selectedRouteNo);
    const routeLabel = chosenRouteObj ? `Route ${chosenRouteObj.routeNo} (${chosenRouteObj.routeName})` : `Route ${selectedRouteNo}`;

    const viaLabels = VIA_WAYPOINT_OPTIONS
      .filter(w => selectedViaWays.includes(w.id))
      .map(w => w.label.replace('Via ', ''))
      .join(', ');

    const customTargetDescription = `${routeLabel} [${originStation} ➔ ${destinationStation}${viaLabels ? ` via ${viaLabels}` : ''}]`;

    // Execute Diversion
    divertBus(selectedBusId, customTargetDescription);

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="glass-card rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-amber-400 tracking-wider uppercase block">
              MANUAL DISPATCH CONTROL
            </span>
            <h3 className="font-mono text-base font-bold text-white tracking-wide">
              CUSTOM BUS DIVERSION PANEL
            </h3>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          OPERATOR OVERRIDE
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        
        {/* Row 1: Bus Selection */}
        <div className="space-y-1.5">
          <label className="text-white font-bold flex items-center space-x-1.5">
            <BusIcon className="h-4 w-4 text-cyan-400" />
            <span>SELECT VEHICLE TO DIVERT</span>
          </label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full rounded-xl bg-[#091b33] border border-white/30 p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none shadow-sm"
          >
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id} className="bg-[#0a192f] text-white font-bold">
                {bus.id} ({bus.busNumber}) - Current: {bus.routeName} [{bus.currentStop}] {bus.isDiverted ? '(DIVERTED)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Grid 2 Columns: 1) Route Number & 2) Origin Station */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1) Route Number (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-amber-300 font-bold flex items-center space-x-1.5">
              <Navigation className="h-4 w-4 text-amber-400" />
              <span>1) ROUTE NUMBER</span>
            </label>
            <select
              value={selectedRouteNo}
              onChange={(e) => {
                setSelectedRouteNo(e.target.value);
                const routeObj = BRTS_ROUTES.find(r => r.routeNo === e.target.value);
                if (routeObj) {
                  setOriginStation(routeObj.startPoint);
                  setDestinationStation(routeObj.endPoint);
                }
              }}
              className="w-full rounded-xl bg-[#091b33] border border-white/30 p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none shadow-sm"
            >
              {BRTS_ROUTES.map((route) => (
                <option key={route.routeNo} value={route.routeNo} className="bg-[#0a192f] text-white font-bold">
                  Route {route.routeNo} : {route.routeName}
                </option>
              ))}
              <option value="9_EXPRESS" className="bg-[#0a192f] text-amber-300 font-bold">
                Route 9 Express (RTO Circle ➔ LD College)
              </option>
            </select>
          </div>

          {/* 2) Origin Station (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-cyan-300 font-bold flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>2) ORIGIN STATION</span>
            </label>
            <select
              value={originStation}
              onChange={(e) => setOriginStation(e.target.value)}
              className="w-full rounded-xl bg-[#091b33] border border-white/30 p-2.5 text-white font-bold focus:border-cyan-400 focus:outline-none shadow-sm"
            >
              {AHMEDABAD_STOPS.map((stop) => (
                <option key={stop.id} value={stop.name} className="bg-[#0a192f] text-white font-bold">
                  {stop.name} (Corridor {stop.routeId})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 3: 3) Drop (Destination Station) Dropdown */}
        <div className="space-y-1.5">
          <label className="text-emerald-300 font-bold flex items-center space-x-1.5">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span>3) DROP (DESTINATION STATION)</span>
          </label>
          <select
            value={destinationStation}
            onChange={(e) => setDestinationStation(e.target.value)}
            className="w-full rounded-xl bg-[#091b33] border border-white/30 p-2.5 text-white font-bold focus:border-emerald-400 focus:outline-none shadow-sm"
          >
            {AHMEDABAD_STOPS.map((stop) => (
              <option key={stop.id} value={stop.name} className="bg-[#0a192f] text-white font-bold">
                {stop.name} (Corridor {stop.routeId})
              </option>
            ))}
          </select>
        </div>

        {/* Row 4: 4) Through Which Way (Checkboxes) */}
        <div className="space-y-2 pt-2 border-t border-white/20">
          <label className="text-amber-300 font-bold flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>4) THROUGH WHICH WAY (SELECT VIA CHECKBOXES)</span>
            </div>
            <span className="text-[11px] text-slate-200 font-semibold">Select intermediate corridors</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#09182d] p-3 rounded-xl border border-white/20">
            {VIA_WAYPOINT_OPTIONS.map((way) => {
              const isChecked = selectedViaWays.includes(way.id);
              return (
                <button
                  type="button"
                  key={way.id}
                  onClick={() => toggleViaWay(way.id)}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-lg text-left transition-all ${
                    isChecked
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400 font-bold shadow-sm'
                      : 'bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white border border-white/10 font-semibold'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                  <span className="text-xs text-white font-medium">{way.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              BUS {selectedBusId} SUCCESSFULLY DIVERTED TO ROUTE {selectedRouteNo} ({originStation} ➔ {destinationStation})!
            </span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black font-mono font-black text-xs tracking-wider hover:brightness-125 shadow-glow-amber transition-all transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <Send className="h-4 w-4 fill-black" />
          <span>EXECUTE CUSTOM BUS DIVERSION</span>
        </button>

      </form>

    </div>
  );
}
