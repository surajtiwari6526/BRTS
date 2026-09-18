import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, BRTSStop } from '../../types/brts';
import { ROUTE_PATHS, getRoutePath } from '../../data/routePaths';

interface LeafletMapWrapperProps {
  buses: Bus[];
  stops: BRTSStop[];
  route9Path: [number, number][];
  route12Path: [number, number][];
  route9ExpressPath: [number, number][];
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
  onDivertBus?: (busId: string) => void;
}

const routeLineColors: Record<string, string> = {
  ROUTE_1: '#0F172A', ROUTE_2: '#16A34A', ROUTE_3: '#EA580C', ROUTE_4: '#854D0E',
  ROUTE_5: '#991B1B', ROUTE_6: '#475569', ROUTE_7: '#0284C7', ROUTE_8: '#B45309',
  ROUTE_9: '#DC2626', ROUTE_11: '#7E22CE', ROUTE_12: '#16A34A', ROUTE_14: '#C2410C',
  ROUTE_15: '#0369A1', ROUTE_16: '#A16207', ROUTE_17: '#15803D', ROUTE_18: '#BE185D',
  ROUTE_101: '#0F172A', ROUTE_201: '#EA580C'
};

// Sub-component to smoothly fly map to new center/zoom
function MapViewFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const createBusIcon = (bus: Bus, isSelected: boolean) => {
  const isOverloaded = bus.status === 'CRITICAL_OVERLOAD' || bus.status === 'OVERLOAD';
  const isDiverted = bus.isDiverted;

  let borderColor = '#0F172A';
  let fillColor = '#FFFFFF';
  let ringHtml = '';

  if (isOverloaded) {
    borderColor = '#DC2626';
    ringHtml = `<div class="pulsing-ring-red"></div>`;
  } else if (isDiverted) {
    borderColor = '#EA580C';
    ringHtml = `<div class="pulsing-ring-amber"></div>`;
  } else if (bus.status === 'UNDERUTILIZED') {
    borderColor = '#16A34A';
  }

  const iconSize = isSelected ? 48 : 40;

  const html = `
    <div style="position: relative; width: ${iconSize}px; height: ${iconSize}px; display: flex; align-items: center; justify-content: center;">
      ${ringHtml}
      <div style="
        width: ${iconSize - 8}px;
        height: ${iconSize - 8}px;
        border-radius: 50%;
        background-color: ${fillColor};
        border: 2.5px solid ${borderColor};
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transform: rotate(${bus.heading}deg);
        transition: transform 0.5s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${borderColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${
            isDiverted
              ? '<path d="m18 9 3 3-3 3"/><path d="M3 12h18"/><path d="m6 9-3 3 3 3"/>'
              : '<polygon points="12 2 19 21 12 17 5 21 12 2"/>'
          }
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        font-family: monospace;
        font-size: 9px;
        font-weight: 800;
        color: #0F172A;
        background: #FFFFFF;
        border: 1px solid ${borderColor};
        padding: 1px 4px;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        ${bus.id.replace('BUS-', '')} | ${bus.plfPercent}%
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-bus-div-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  });
};

const createStationIcon = (stop: BRTSStop) => {
  const isOrigin = stop.id === 'STOP-01'; // RTO Circle
  const isTerminalR9 = stop.id === 'STOP-06'; // LD College
  const isTerminalR12 = stop.id === 'STOP-14'; // CTM Cross Road

  let prefixIcon = '🚏 ';
  let tagSuffix = '';
  if (isOrigin) {
    prefixIcon = '🚩 ';
    tagSuffix = ' [ORIGIN]';
  } else if (isTerminalR9 || isTerminalR12) {
    prefixIcon = '🏁 ';
    tagSuffix = ' [TERMINAL]';
  } else if (stop.id === 'STOP-09') {
    prefixIcon = '🔀 ';
    tagSuffix = ' [HUB]';
  } else if (stop.id === 'STOP-13') {
    prefixIcon = '🚉 ';
    tagSuffix = ' [RAILWAY]';
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <!-- Station Name Label -->
      <div style="
        position: absolute;
        bottom: 18px;
        white-space: nowrap;
        font-family: monospace;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.96);
        border: 1.5px solid #DC2626;
        color: #B91C1C;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        pointer-events: none;
        z-index: 100;
      ">
        ${prefixIcon}${stop.name}${tagSuffix}
      </div>

      <!-- Glowing Red Pin Dot -->
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #DC2626;
        border: 2px solid #FFFFFF;
        box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
        position: relative;
        z-index: 50;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-red-station-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const getBusRouteDetails = (bus: Bus) => {
  if (bus.isDiverted) {
    return {
      origin: 'Nehrunagar Circle (Reroute Point)',
      destination: 'Jaimangal BRTS / LD College',
      corridor: 'Express 9X (Dynamic Reroute)',
      originLat: 23.0188,
      originLng: 72.5394,
      destLat: 23.0611,
      destLng: 72.5489,
      progressPercent: Math.min(95, Math.max(25, bus.plfPercent > 100 ? 80 : 45))
    };
  }
  const path = getRoutePath(bus.routeId);
  const start = path[0];
  const end = path[path.length - 1];
  return {
    origin: bus.isDiverted ? 'Nehrunagar Circle (Reroute Point)' : `Route ${bus.routeId.replace('ROUTE_', '')} origin`,
    destination: bus.isDiverted ? 'LD Engineering College / Jaimangal' : `Route ${bus.routeId.replace('ROUTE_', '')} terminal`,
    corridor: bus.isDiverted ? 'Express 9X dynamic reroute' : `Published Ahmedabad BRTS route ${bus.routeId.replace('ROUTE_', '')}`,
    originLat: start[0],
    originLng: start[1],
    destLat: end[0],
    destLng: end[1],
    progressPercent: Math.min(95, Math.max(20, Math.round(bus.speedKmph * 2.2)))
  };
};

export default function LeafletMapWrapper({
  buses,
  stops,
  route9Path,
  route12Path,
  route9ExpressPath,
  selectedBusId,
  onSelectBus,
  onDivertBus
}: LeafletMapWrapperProps) {
  // Map View Settings (Default to Entire India or BRTS City View)
  const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
  const BRTS_CENTER: [number, number] = [23.0338, 72.5468];

  const [mapTarget, setMapTarget] = useState<{ center: [number, number]; zoom: number }>({
    center: BRTS_CENTER,
    zoom: 13
  });

  // Map Provider State: 'google-roadmap' | 'google-satellite' | 'carto'
  const [provider, setProvider] = useState<'google-roadmap' | 'google-satellite' | 'carto'>('google-roadmap');

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || '';

  // Calculate Tile URL & Subdomains based on provider
  let tileUrl = `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${googleApiKey ? `&key=${googleApiKey}` : ''}`;
  let tileSubdomains: string | string[] = ['mt0', 'mt1', 'mt2', 'mt3'];
  let tileAttribution = '&copy; <a href="https://maps.google.com">Google Maps</a>';

  if (provider === 'google-satellite') {
    tileUrl = `https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}${googleApiKey ? `&key=${googleApiKey}` : ''}`;
  } else if (provider === 'carto') {
    tileUrl = cartoApiKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    tileSubdomains = "abcd";
    tileAttribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
  }

  // Selected bus details for active trip highlighting
  const selectedBus = buses.find(b => b.id === selectedBusId);
  const selectedBusTrip = selectedBus ? getBusRouteDetails(selectedBus) : null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md">
      {/* Interactive Floating Control Bar */}
      <div className="absolute top-4 right-4 z-[400] flex flex-wrap gap-2 items-center bg-white/95 p-2 rounded-xl border border-slate-200 backdrop-blur-md shadow-lg">
        {/* View Range Buttons */}
        <button
          onClick={() => setMapTarget({ center: INDIA_CENTER, zoom: 5 })}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
            mapTarget.zoom === 5
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-orange-50'
          }`}
        >
          <span>🇮🇳</span>
          <span>ENTIRE INDIA VIEW</span>
        </button>

        <button
          onClick={() => setMapTarget({ center: BRTS_CENTER, zoom: 13 })}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
            mapTarget.zoom === 13
              ? 'bg-[#16A34A] text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-orange-50'
          }`}
        >
          <span>🚌</span>
          <span>BRTS CORRIDOR</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-300 mx-1" />

        {/* Map Provider Selector */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px] font-mono">
          <button
            onClick={() => setProvider('google-roadmap')}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              provider === 'google-roadmap' ? 'bg-[#EA580C] text-white' : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            Google Map
          </button>

          <button
            onClick={() => setProvider('google-satellite')}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              provider === 'google-satellite' ? 'bg-[#EA580C] text-white' : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            Satellite
          </button>

          <button
            onClick={() => setProvider('carto')}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              provider === 'carto' ? 'bg-[#EA580C] text-white' : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            Light Canvas
          </button>
        </div>
      </div>

      <MapContainer
        center={mapTarget.center}
        zoom={mapTarget.zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapViewFlyTo center={mapTarget.center} zoom={mapTarget.zoom} />

        {/* Base Map Tiles */}
        <TileLayer
          key={provider}
          attribution={tileAttribution}
          url={tileUrl}
          subdomains={tileSubdomains}
          maxZoom={19}
        />

        {/* Published Ahmedabad BRTS route corridors from the supplied schedule. */}
        {Object.entries(ROUTE_PATHS).map(([routeId, path]) => (
          <Polyline
            key={routeId}
            positions={path}
            pathOptions={{
              color: routeLineColors[routeId] ?? '#163b64',
              weight: routeId === 'ROUTE_9' || routeId === 'ROUTE_12' ? 5 : 3,
              opacity: routeId === 'ROUTE_9' || routeId === 'ROUTE_12' ? 0.82 : 0.52
            }}
          />
        ))}

        {/* Express 9X bridge-safe reroute path */}
        <Polyline
          positions={route9ExpressPath}
          pathOptions={{
            color: '#e87518',
            weight: 6,
            opacity: 0.85,
            dashArray: '12, 6'
          }}
        />

        {/* Dynamic Highlighted Active Journey Line for Selected Bus */}
        {selectedBus && selectedBusTrip && (
          <Polyline
            positions={[
              [selectedBusTrip.originLat, selectedBusTrip.originLng],
              [selectedBus.lat, selectedBus.lng],
              [selectedBusTrip.destLat, selectedBusTrip.destLng]
            ]}
            pathOptions={{
              color: '#e87518',
              weight: 6,
              opacity: 0.95
            }}
          />
        )}

        {/* BRTS Bus Stand Markers with Custom HTML Badges */}
        {stops.map((stop) => {
          const stationIcon = createStationIcon(stop);
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={stationIcon}
            >
              <Popup>
                <div className="font-sans text-xs p-1 space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <p className="font-bold text-cyan-300 text-sm">{stop.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      stop.rushLevel === 'CRITICAL_SURGE' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      stop.rushLevel === 'HIGH_RUSH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {stop.rushLevel ? stop.rushLevel.replace('_', ' ') : 'NORMAL'}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 font-mono">BRTS Station ID: {stop.id}</p>
                  
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono">
                    <div>
                      <span className="text-gray-400 block text-[8px]">TICKETS (1HR)</span>
                      <span className="text-cyan-300 font-bold">🎟️ {stop.ticketsSoldLastHour || 120}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[8px]">WAITING PAX</span>
                      <span className={`font-bold ${stop.waitingPassengers && stop.waitingPassengers > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                        👥 {stop.waitingPassengers || 15} Pax
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-white/10 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                    <span>Corridor: {stop.routeId === 'SHARED' ? 'RTO Hub' : stop.routeId}</span>
                    <span>✓ AFCS Active</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Moving 10 BRTS Bus Markers */}
        {buses.map((bus) => {
          const isSelected = selectedBusId === bus.id;
          const icon = createBusIcon(bus, isSelected);
          const journey = getBusRouteDetails(bus);

          return (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectBus && onSelectBus(bus.id)
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs font-sans min-w-[240px]">
                  {/* Title & Status */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div>
                      <span className="font-mono font-bold text-[#00F2FE] text-sm">{bus.id}</span>
                      <p className="text-[10px] text-gray-400 font-mono">{bus.busNumber}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        bus.status === 'CRITICAL_OVERLOAD'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : bus.status === 'OVERLOAD'
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                          : bus.isDiverted
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {bus.status}
                    </span>
                  </div>

                  {/* Origin to Destination Trajectory Banner */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="text-amber-400 font-bold">🚩 {journey.origin}</span>
                      <span>➔</span>
                      <span className="text-emerald-400 font-bold">🏁 {journey.destination}</span>
                    </div>

                    {/* Route Progress Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Current Stop: <strong className="text-white">{bus.currentStop}</strong></span>
                        <span className="text-cyan-300 font-bold">{journey.progressPercent}% Completed</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${journey.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-gray-400 block text-[9px]">PASSENGERS</span>
                      <span className="text-white font-bold">{bus.currentPassengers} / {bus.capacity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">PLF RATE</span>
                      <span className={`font-bold ${bus.plfPercent > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {bus.plfPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">CURRENT SPEED</span>
                      <span className="text-cyan-300 font-bold">{bus.speedKmph} km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">ACTIVE ROUTE</span>
                      <span className="text-purple-300 font-bold">
                        {bus.isDiverted ? 'EXPRESS 9X' : bus.routeId}
                      </span>
                    </div>
                  </div>

                  {!bus.isDiverted && bus.routeId === 'ROUTE_12' && onDivertBus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDivertBus(bus.id);
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-[11px] hover:brightness-110 shadow-glow-amber transition-all"
                    >
                      ⚡ DIVERT TO ROUTE 9 EXPRESS
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 p-3 border border-slate-200 backdrop-blur-md text-[11px] space-y-1.5 font-mono shadow-md hidden sm:block text-slate-800">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">BRTS Corridor & Station Legend</div>
        <div className="flex items-center space-x-2">
          <span className="text-orange-600 font-bold">🚩</span>
          <span className="text-slate-800 font-semibold">RTO Circle (Origin Hub)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-red-600 font-bold">🏁</span>
          <span className="text-slate-800 font-semibold">LD College / CTM (Terminal Stations)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-6 rounded bg-[#DC2626]" />
          <span className="text-slate-800 font-semibold">Route 9 (Overloaded Corridor)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-6 rounded bg-[#16A34A]" />
          <span className="text-slate-800 font-semibold">Route 12 (Underutilized Corridor)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-6 rounded bg-[#EA580C]" />
          <span className="text-slate-800 font-semibold">Express 9X (Dynamic Reroute)</span>
        </div>
      </div>
    </div>
  );
}
