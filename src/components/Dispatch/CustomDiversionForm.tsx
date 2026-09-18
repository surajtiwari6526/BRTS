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
    <div className="glass-card rounded-2xl border border-orange-200 bg-white p-5 space-y-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-800 border border-orange-300">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-orange-900 tracking-wider uppercase block">
              MANUAL DISPATCH CONTROL
            </span>
            <h3 className="font-mono text-base font-bold text-[#0F172A] tracking-wide">
              CUSTOM BUS DIVERSION PANEL
            </h3>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-300">
          OPERATOR OVERRIDE
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        
        {/* Row 1: Bus Selection */}
        <div className="space-y-1.5">
          <label className="text-[#0F172A] font-bold flex items-center space-x-1.5">
            <BusIcon className="h-4 w-4 text-orange-600" />
            <span>SELECT VEHICLE TO DIVERT</span>
          </label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-[#0F172A] font-bold focus:border-orange-500 focus:outline-none shadow-2xs"
          >
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id} className="bg-white text-[#0F172A] font-bold">
                {bus.id} ({bus.busNumber}) - Current: {bus.routeName} [{bus.currentStop}] {bus.isDiverted ? '(DIVERTED)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Grid 2 Columns: 1) Route Number & 2) Origin Station */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1) Route Number (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-orange-900 font-bold flex items-center space-x-1.5">
              <Navigation className="h-4 w-4 text-orange-600" />
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
              className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-[#0F172A] font-bold focus:border-orange-500 focus:outline-none shadow-2xs"
            >
              {BRTS_ROUTES.map((route) => (
                <option key={route.routeNo} value={route.routeNo} className="bg-white text-[#0F172A] font-bold">
                  Route {route.routeNo} : {route.routeName}
                </option>
              ))}
              <option value="9_EXPRESS" className="bg-white text-orange-900 font-bold">
                Route 9 Express (RTO Circle ➔ LD College)
              </option>
            </select>
          </div>

          {/* 2) Origin Station (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-[#0F172A] font-bold flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span>2) ORIGIN STATION</span>
            </label>
            <select
              value={originStation}
              onChange={(e) => setOriginStation(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-[#0F172A] font-bold focus:border-orange-500 focus:outline-none shadow-2xs"
            >
              {AHMEDABAD_STOPS.map((stop) => (
                <option key={stop.id} value={stop.name} className="bg-white text-[#0F172A] font-bold">
                  {stop.name} (Corridor {stop.routeId})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 3: 3) Drop (Destination Station) Dropdown */}
        <div className="space-y-1.5">
          <label className="text-emerald-800 font-bold flex items-center space-x-1.5">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>3) DROP (DESTINATION STATION)</span>
          </label>
          <select
            value={destinationStation}
            onChange={(e) => setDestinationStation(e.target.value)}
            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-[#0F172A] font-bold focus:border-emerald-600 focus:outline-none shadow-2xs"
          >
            {AHMEDABAD_STOPS.map((stop) => (
              <option key={stop.id} value={stop.name} className="bg-white text-[#0F172A] font-bold">
                {stop.name} (Corridor {stop.routeId})
              </option>
            ))}
          </select>
        </div>

        {/* Row 4: 4) Through Which Way (Checkboxes) */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="text-orange-900 font-bold flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <span>4) THROUGH WHICH WAY (SELECT VIA CHECKBOXES)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">Select intermediate corridors</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {VIA_WAYPOINT_OPTIONS.map((way) => {
              const isChecked = selectedViaWays.includes(way.id);
              return (
                <button
                  type="button"
                  key={way.id}
                  onClick={() => toggleViaWay(way.id)}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-lg text-left transition-all ${
                    isChecked
                      ? 'bg-orange-100 text-orange-900 border border-orange-300 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-orange-600 shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs text-slate-900 font-medium">{way.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>
              BUS {selectedBusId} SUCCESSFULLY DIVERTED TO ROUTE {selectedRouteNo} ({originStation} ➔ {destinationStation})!
            </span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-mono font-black text-xs tracking-wider shadow-brts-saffron hover:brightness-110 transition-all border border-orange-500 flex items-center justify-center space-x-2"
        >
          <Send className="h-4 w-4 fill-white" />
          <span>EXECUTE CUSTOM BUS DIVERSION</span>
        </button>

      </form>

    </div>
  );
}
