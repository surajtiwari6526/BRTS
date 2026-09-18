'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { RouteReferencePanel } from '../../components/Routes/RouteReferencePanel';
import { DivertedBusesPanel } from '../../components/Analytics/DivertedBusesPanel';
import { BRTS_ROUTES } from '../../data/routeCatalog';
import { 
  Smartphone, 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  Ticket, 
  Sparkles, 
  Check, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  Zap,
  Info,
  ArrowDownUp,
  Route as RouteIcon
} from 'lucide-react';

export default function CommuterPage() {
  const { buses } = useSimulation();

  const [origin, setOrigin] = useState<string>('RTO Circle BRTS');
  const [destination, setDestination] = useState<string>('LD Engineering College');
  const [selectedOption, setSelectedOption] = useState<'FASTEST' | 'COMFORT' | null>('COMFORT');
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [routeSearchMessage, setRouteSearchMessage] = useState<string>('Choose your stations, then find the best live route.');
  const [bestRouteLabel, setBestRouteLabel] = useState<string>('Not calculated');

  // Derive dynamic rush status from live buses
  const route9Overloaded = buses.filter(b => b.routeId === 'ROUTE_9' && (b.status === 'CRITICAL_OVERLOAD' || b.status === 'OVERLOAD')).length > 0;
  const expressBusesActive = buses.filter(b => b.isDiverted).length;
  const directRoute = BRTS_ROUTES.find((route) => route.routeNo === '3')!;
  const transferRoute = BRTS_ROUTES.find((route) => route.routeNo === '12')!;
  const directFare = directRoute.maxFareInr;
  const transferFare = Math.round(transferRoute.maxFareInr * 0.67);
  const networkStations = Array.from(new Set(BRTS_ROUTES.flatMap((route) => [route.startPoint, route.endPoint, ...route.intermediateStops])));
  const interchangeStop = 'Nehrunagar Circle';
  const liveFareLabel = selectedOption === 'COMFORT' ? `Rs ${transferFare}` : `Rs ${directFare}`;
  const canTransfer = expressBusesActive > 0;
  const isTransferPlan = selectedOption === 'COMFORT';

  const normalizeStation = (value: string) => value.toLowerCase().replace(/brts|station|engineering|college|cross roads?|road|\(|\)|-/g, '').replace(/\s+/g, ' ').trim();
  const routeIncludesStation = (route: typeof directRoute, station: string) => {
    const target = normalizeStation(station);
    return [route.startPoint, route.endPoint, ...route.intermediateStops].some((stop) => {
      const normalizedStop = normalizeStation(stop);
      return normalizedStop.includes(target) || target.includes(normalizedStop);
    });
  };

  const findBestRoute = () => {
    const matchingDirectRoute = BRTS_ROUTES.find((route) => routeIncludesStation(route, origin) && routeIncludesStation(route, destination));
    const bestOption = canTransfer ? 'COMFORT' : 'FASTEST';
    setSelectedOption(bestOption);
    if (canTransfer) {
      setBestRouteLabel(`Route ${transferRoute.routeNo} + Express 9X`);
      setRouteSearchMessage(`Best route found: board Route ${transferRoute.routeNo}, change at ${interchangeStop}, then use Express 9X. ${expressBusesActive} active express bus${expressBusesActive === 1 ? '' : 'es'} make this the lowest-load live option.`);
      return;
    }

    const directLabel = matchingDirectRoute ? `Route ${matchingDirectRoute.routeNo} (${matchingDirectRoute.routeName})` : `Route ${directRoute.routeNo} demand corridor`;
    setBestRouteLabel(directLabel);
    setRouteSearchMessage(`Best route found: ${directLabel}. No active Express 9X transfer is available, so stay on the direct corridor.`);
  };

  const selectOption = (option: 'FASTEST' | 'COMFORT') => {
    setSelectedOption(option);
    setBestRouteLabel(option === 'COMFORT' ? `Route ${transferRoute.routeNo} + Express 9X` : `Route ${directRoute.routeNo} (${directRoute.routeName})`);
    setRouteSearchMessage(option === 'COMFORT'
      ? `Comfort plan selected: change at ${interchangeStop} for a lower-load journey.`
      : `Direct plan selected: stay on the Route ${directRoute.routeNo} corridor for the fastest trip.`);
  };

  const handleStationChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    setter(event.target.value);
    setBestRouteLabel('Not calculated');
    setRouteSearchMessage('Stations changed. Find the best live route again.');
  };

  const openTicket = () => {
    setTicketId(`BRTS-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowTicketModal(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8">
      
      {/* Container Frame simulating modern passenger smartphone interface */}
      <div className="w-full max-w-md glass-card rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl relative overflow-hidden space-y-5">
        
        {/* Phone Notch & Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold text-[#0F172A] block">BRTS Commuter Pulse</span>
              <span className="text-[10px] text-emerald-700 font-mono flex items-center space-x-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Live fare estimate · {liveFareLabel}</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300 font-bold">
            Janmarg BRTS
          </span>
        </div>

        {/* Origin & Destination Search Form */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
          
          <div className="relative flex items-center space-x-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="h-3 w-3 rounded-full bg-orange-600" />
              <div className="h-6 w-0.5 bg-slate-300" />
              <div className="h-3 w-3 rounded-full bg-[#0F172A]" />
            </div>

            <div className="flex-1 space-y-2 text-xs font-mono">
              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block">ORIGIN STATION</label>
                <select
                  value={origin}
                  onChange={handleStationChange(setOrigin)}
                  className="w-full bg-white text-slate-900 font-bold rounded-lg px-2.5 py-1.5 border border-slate-200 focus:border-orange-500 outline-none"
                >
                  <option value="RTO Circle BRTS">RTO Circle BRTS Station</option>
                  {networkStations.slice(0, 18).map((station) => <option key={`origin-${station}`} value={station}>{station}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block">DESTINATION</label>
                <select
                  value={destination}
                  onChange={handleStationChange(setDestination)}
                  className="w-full bg-white text-slate-900 font-bold rounded-lg px-2.5 py-1.5 border border-slate-200 focus:border-orange-500 outline-none"
                >
                  <option value="LD Engineering College">LD Engineering College</option>
                  <option value="Gujarat University">Gujarat University</option>
                  <option value="Maninagar Railway Station">Maninagar Station</option>
                  {networkStations.slice(0, 18).map((station) => <option key={`destination-${station}`} value={station}>{station}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={findBestRoute}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
          >
            <Navigation className="h-4 w-4 text-orange-400" />
            Find best route
          </button>
          <p className="text-[10px] leading-relaxed text-slate-600 font-medium">{routeSearchMessage}</p>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] font-mono"><span className="text-slate-500 font-bold">Selected plan</span><strong className="text-[#0F172A]">{bestRouteLabel}</strong></div>

        </div>

        {/* Step-by-step journey guidance */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-900">
              <RouteIcon className="h-4 w-4 text-orange-600" /> Suggested journey plan
            </div>
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">LIVE</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center text-[10px] font-mono">
            <div className="rounded-lg bg-white p-2 border border-orange-200"><strong className="block text-[#0F172A]">1. Board</strong><span className="text-slate-600">Route {isTransferPlan ? transferRoute.routeNo : directRoute.routeNo}</span></div>
            <ArrowDownUp className="h-3.5 w-3.5 rotate-90 text-orange-600" />
            <div className="rounded-lg bg-white p-2 border border-orange-200"><strong className="block text-[#0F172A]">{isTransferPlan ? '2. Change' : '2. Arrive'}</strong><span className="text-orange-700 font-bold">{isTransferPlan ? interchangeStop : destination}</span></div>
            <ArrowDownUp className="h-3.5 w-3.5 rotate-90 text-orange-600" />
            <div className="rounded-lg bg-white p-2 border border-orange-200"><strong className="block text-[#0F172A]">{isTransferPlan ? '3. Continue' : '3. ETA'}</strong><span className="text-slate-600">{isTransferPlan ? 'Express 9X' : '18 mins'}</span></div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700 font-medium"><strong>{origin} to {destination}:</strong> {isTransferPlan ? `use Route ${transferRoute.routeNo}, change at ${interchangeStop}, then board the next Express 9X bus. ${expressBusesActive > 0 ? `${expressBusesActive} express buses are active now.` : 'No express bus is currently active; use the direct option if the transfer is time-sensitive.'}` : `stay on Route ${directRoute.routeNo} for the direct journey to ${destination}.`}</p>
        </div>

        {/* Live Route Choices Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>RECOMMENDED JOURNEY OPTIONS</span>
            <span className="text-orange-600 text-[10px]">Real-Time PLF Sensing</span>
          </div>

          {/* Option A: Fastest Route */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => selectOption('FASTEST')}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') selectOption('FASTEST'); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
              selectedOption === 'FASTEST'
                ? 'border-red-400 bg-red-50/70 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300">
                  OPTION A: FASTEST
                </span>
                {route9Overloaded && (
                  <span className="text-[10px] text-red-700 font-mono font-bold animate-pulse">
                    ⚠️ SEVERE CROWD
                  </span>
                )}
              </div>
                <span className="text-base font-bold font-mono text-[#0F172A]">Rs {directFare}</span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-slate-700">
              <span className="font-bold text-[#0F172A] flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-red-600" />
                <span>18 Mins · Route {directRoute.routeNo} demand corridor</span>
              </span>
              <span className="text-red-700 font-bold">98% Rush (Standing Room Only)</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-tight font-medium">
              Direct option using the {directRoute.routeName} network corridor. {route9Overloaded ? 'Live demand is above capacity; expect standing room only.' : 'Live demand is currently within operating capacity.'}
            </p>
          </div>

          {/* Option B: Comfort Route (Dynamic Discount & Guaranteed Seat) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => selectOption('COMFORT')}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') selectOption('COMFORT'); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative overflow-hidden ${
              selectedOption === 'COMFORT'
                ? 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>OPTION B: COMFORT CHOICE</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-300">
                  33% DYNAMIC DISCOUNT
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 line-through mr-1 font-mono">Rs {transferRoute.maxFareInr}</span>
                <span className="text-base font-bold font-mono text-emerald-800">Rs {transferFare}</span>
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-slate-700">
              <span className="font-bold text-[#0F172A] flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span>22 Mins · Route {transferRoute.routeNo} + Express 9X</span>
              </span>
              <span className="text-emerald-800 font-bold">15% Rush (Guaranteed Seat)</span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[10px] font-mono text-emerald-900 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <Zap className="h-3 w-3 text-emerald-700" />
                <span>REROUTE BENEFIT:</span>
              </div>
              <p>
                Board Route 12 underutilized bus → Seamless transfer at Nehrunagar Circle onto active Express 9X rerouted bus with guaranteed seating.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button: Book Dynamic Digital Ticket */}
        <button
          onClick={openTicket}
          disabled={!selectedOption}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-mono font-black text-xs tracking-wider shadow-brts-saffron hover:brightness-110 transition-all flex items-center justify-center space-x-2 border border-orange-500"
        >
          <Ticket className="h-5 w-5" />
          <span>BOOK DYNAMIC QR TICKET (Rs {selectedOption === 'COMFORT' ? transferFare : directFare})</span>
        </button>

      </div>

      <div className="w-full max-w-md space-y-4 mt-6">
        <DivertedBusesPanel compact />
        <RouteReferencePanel compact />
      </div>

      {/* Dynamic Digital QR Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-slate-200 bg-white p-6 space-y-4 text-center shadow-xl relative">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="font-mono text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>DYNAMIC DIGITAL TRANSIT PASS</span>
              </span>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-slate-800 font-mono text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-slate-50 text-black border border-slate-200 space-y-2 mx-auto inline-block shadow-2xs">
              <div className="flex justify-center">
                <QrCode className="h-36 w-36 text-slate-900" />
              </div>
              <p className="font-mono text-[10px] text-slate-600 font-bold tracking-widest">
                TICKET ID: {ticketId}
              </p>
            </div>

            <div className="text-xs font-mono space-y-1">
              <div className="text-[#0F172A] font-bold text-sm">
                {origin} → {destination}
              </div>
              <div className="text-emerald-700 font-bold">
                {selectedOption === 'COMFORT' ? 'Comfort Option (Guaranteed Seat - 33% Off)' : 'Fastest Direct Option'}
              </div>
              <div className="text-slate-500 text-[10px] font-medium">
                Valid for 1 Trip across Janmarg BRTS Corridors
              </div>
            </div>

            <button
              onClick={() => setShowTicketModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 font-mono font-bold text-xs hover:bg-orange-200"
            >
              DONE / BACK TO SIMULATOR
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
