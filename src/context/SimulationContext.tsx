'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bus, BusStatus, DispatchLog, DPRMetrics, BRTSStop, RouteTicketingSummary, RushLevel } from '../types/brts';
import { INITIAL_BUSES, AHMEDABAD_STOPS } from '../data/initialDataset';

interface SimulationContextType {
  buses: Bus[];
  stops: BRTSStop[];
  isSimulating: boolean;
  toggleSimulation: () => void;
  divertBus: (busId: string, targetRoute?: string) => void;
  autoDivertEmptyBuses: () => void;
  resetSimulation: () => void;
  dispatchLogs: DispatchLog[];
  dprMetrics: DPRMetrics;
  updateDPRParams: (wSaved: number, fuelCost: number) => void;
  triggerAudioChime: () => void;
  lastAlert: string | null;
  clearAlert: () => void;
  weatherFactor: number;
  routeTicketingSummaries: RouteTicketingSummary[];
  totalTicketsSold: number;
  totalRevenueRupees: number;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [stops, setStops] = useState<BRTSStop[]>(AHMEDABAD_STOPS);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([
    {
      id: 'LOG-101',
      timestamp: new Date().toLocaleTimeString(),
      busId: 'BUS-1201',
      busNumber: 'GJ-01-CZ-2001',
      sourceRoute: 'ROUTE_12',
      targetRoute: 'ROUTE_9_EXPRESS',
      dpr: 3.4,
      benefit: 4820
    }
  ]);

  const [wSaved, setWSaved] = useState<number>(14); // minutes saved per passenger
  const [fuelCost, setFuelCost] = useState<number>(450); // rupees deadhead cost
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [weatherFactor] = useState<number>(1.2); // Demand multiplier

  // Synthesize audio chime using Web Audio API
  const triggerAudioChime = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio playback silently fallback if blocked
    }
  }, []);

  // Compute DPR Metrics algorithmically
  const computeDPR = useCallback((): DPRMetrics => {
    const route9Buses = buses.filter(b => b.routeId === 'ROUTE_9');
    const totalOverloadPax = route9Buses.reduce((acc, b) => acc + Math.max(0, b.currentPassengers - b.capacity), 0);
    const waitingPaxEstimate = 320 + totalOverloadPax * 2.5;

    const passengerTimeValueRupeesPerMin = 2.5; // value of passenger time saved
    const wSavedMin = wSaved;
    const pWaitingPax = Math.round(waitingPaxEstimate);
    const cDeadheadRupees = fuelCost;
    const dRoute12DelayRupees = 320; // minimal delay impact on underutilized route 12

    const grossBenefit = wSavedMin * pWaitingPax * passengerTimeValueRupeesPerMin;
    const costs = cDeadheadRupees + dRoute12DelayRupees;
    const netBenefitRupees = Math.round(grossBenefit - costs);
    const dprRatio = parseFloat((grossBenefit / (costs || 1)).toFixed(2));

    return {
      wSavedMin,
      pWaitingPax,
      cDeadheadRupees,
      dRoute12DelayRupees,
      netBenefitRupees,
      dprRatio,
      isRecommended: netBenefitRupees > 0
    };
  }, [buses, wSaved, fuelCost]);

  const dprMetrics = computeDPR();

  // Simulation step loop: micro movement & passenger count dynamics
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // Micro GPS drift along heading direction
          const radians = (bus.heading * Math.PI) / 180;
          const latDelta = Math.cos(radians) * 0.00025 * (bus.speedKmph / 30);
          const lngDelta = Math.sin(radians) * 0.00025 * (bus.speedKmph / 30);

          let newLat = bus.lat + latDelta;
          let newLng = bus.lng + lngDelta;

          // Boundary clamp for Ahmedabad BRTS bounding box
          if (newLat > 23.0900 || newLat < 22.9800) {
            newLat = bus.lat - latDelta * 2;
          }
          if (newLng > 72.6400 || newLng < 72.5200) {
            newLng = bus.lng - lngDelta * 2;
          }

          // Random passenger fluctuation (-2 to +3 pax)
          const paxDelta = Math.floor(Math.random() * 6) - 2;
          const newPassengers = Math.max(5, Math.min(95, bus.currentPassengers + paxDelta));
          const newPlf = parseFloat(((newPassengers / bus.capacity) * 100).toFixed(1));

          // Derive status from PLF
          let newStatus: BusStatus = bus.status;
          if (newPlf > 110) newStatus = 'CRITICAL_OVERLOAD';
          else if (newPlf >= 100) newStatus = 'OVERLOAD';
          else if (newPlf >= 85) newStatus = 'NEAR_CAPACITY';
          else if (newPlf >= 30) newStatus = 'LOW_RUSH';
          else newStatus = 'UNDERUTILIZED';

          return {
            ...bus,
            lat: parseFloat(newLat.toFixed(6)),
            lng: parseFloat(newLng.toFixed(6)),
            currentPassengers: newPassengers,
            plfPercent: newPlf,
            status: newStatus
          };
        })
      );

      // Increment station ticketing counters dynamically
      setStops((prevStops) =>
        prevStops.map((stop) => {
          const isHighSurge = stop.rushLevel === 'CRITICAL_SURGE' || stop.rushLevel === 'HIGH_RUSH';
          const ticketDelta = isHighSurge ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2);
          const paxDelta = isHighSurge ? Math.floor(Math.random() * 3) - 1 : Math.floor(Math.random() * 2) - 1;

          const newTickets = (stop.ticketsSoldLastHour || 150) + ticketDelta;
          const newWaiting = Math.max(5, (stop.waitingPassengers || 20) + paxDelta);

          let newRush: RushLevel = stop.rushLevel || 'MODERATE_RUSH';
          if (newWaiting > 100) newRush = 'CRITICAL_SURGE';
          else if (newWaiting > 60) newRush = 'HIGH_RUSH';
          else if (newWaiting > 25) newRush = 'MODERATE_RUSH';
          else newRush = 'LOW_RUSH';

          return {
            ...stop,
            ticketsSoldLastHour: newTickets,
            waitingPassengers: newWaiting,
            rushLevel: newRush
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Compute Route Ticketing Summaries dynamically
  const route9Stops = stops.filter((s) => s.routeId === 'ROUTE_9' || s.routeId === 'SHARED');
  const route12Stops = stops.filter((s) => s.routeId === 'ROUTE_12');

  const r9Tickets = route9Stops.reduce((acc, s) => acc + (s.ticketsSoldLastHour || 0), 0);
  const r12Tickets = route12Stops.reduce((acc, s) => acc + (s.ticketsSoldLastHour || 0), 0);

  const TICKET_PRICE_RUPEES = 15;
  const totalTicketsSold = r9Tickets + r12Tickets;
  const totalRevenueRupees = totalTicketsSold * TICKET_PRICE_RUPEES;

  const routeTicketingSummaries: RouteTicketingSummary[] = [
    {
      routeId: 'ROUTE_9',
      routeName: 'RTO Circle ➔ LD College (Corridor 9)',
      totalTicketsSold: r9Tickets,
      totalRevenue: r9Tickets * TICKET_PRICE_RUPEES,
      avgWaitTimeMin: 14.5,
      surgeStatus: 'HIGH SURGE (OVERLOAD)'
    },
    {
      routeId: 'ROUTE_12',
      routeName: 'RTO Circle ➔ CTM Cross Road (Corridor 12)',
      totalTicketsSold: r12Tickets,
      totalRevenue: r12Tickets * TICKET_PRICE_RUPEES,
      avgWaitTimeMin: 3.2,
      surgeStatus: 'LOW DEMAND'
    }
  ];

  const divertBus = (busId: string, targetRoute: string = 'ROUTE_9_EXPRESS') => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === busId) {
          return {
            ...b,
            isDiverted: true,
            divertedTo: targetRoute,
            status: 'UNDERUTILIZED'
          };
        }
        return b;
      })
    );

    const targetBus = buses.find((b) => b.id === busId);
    if (targetBus) {
      const newLog: DispatchLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        busId: targetBus.id,
        busNumber: targetBus.busNumber,
        sourceRoute: targetBus.routeId,
        targetRoute: targetRoute,
        dpr: dprMetrics.dprRatio,
        benefit: dprMetrics.netBenefitRupees
      };
      setDispatchLogs((prev) => [newLog, ...prev]);
    }

    setLastAlert(`BUS ${busId} DIVERTED TO ${targetRoute}`);
    triggerAudioChime();
  };

  const autoDivertEmptyBuses = () => {
    divertBus('BUS-1201', 'ROUTE_9_EXPRESS');
    divertBus('BUS-1205', 'ROUTE_9_EXPRESS');
  };

  const resetSimulation = () => {
    setBuses(INITIAL_BUSES);
    setStops(AHMEDABAD_STOPS);
    setLastAlert('System reset to default initial state.');
  };

  const toggleSimulation = () => setIsSimulating((prev) => !prev);
  const clearAlert = () => setLastAlert(null);
  const updateDPRParams = (saved: number, fuel: number) => {
    setWSaved(saved);
    setFuelCost(fuel);
  };

  return (
    <SimulationContext.Provider
      value={{
        buses,
        stops,
        isSimulating,
        toggleSimulation,
        divertBus,
        autoDivertEmptyBuses,
        resetSimulation,
        dispatchLogs,
        dprMetrics,
        updateDPRParams,
        triggerAudioChime,
        lastAlert,
        clearAlert,
        weatherFactor,
        routeTicketingSummaries,
        totalTicketsSold,
        totalRevenueRupees
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
