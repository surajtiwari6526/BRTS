'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Bus, BusStatus, DispatchLog, DPRMetrics, BRTSStop, RouteTicketingSummary, RushLevel, DispatchRecommendation, LocalModelState, TransitImpactMetrics, TransitScenario, ActiveScenario } from '../types/brts';
import { INITIAL_BUSES, AHMEDABAD_STOPS } from '../data/initialDataset';
import { getRoutePath } from '../data/routePaths';

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
  recommendation: DispatchRecommendation;
  localModel: LocalModelState;
  trainLocalModel: (uploadedRows?: number, sourceName?: string) => void;
  impactMetrics: TransitImpactMetrics;
  activeScenario: ActiveScenario | null;
  activateScenario: (scenario: TransitScenario) => void;
  clearScenario: () => void;
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
  const [activeScenario, setActiveScenario] = useState<ActiveScenario | null>(null);
  const [localModel, setLocalModel] = useState<LocalModelState>({
    status: 'READY',
    version: 'local-baseline-1.0',
    trainingExamples: INITIAL_BUSES.length + AHMEDABAD_STOPS.length,
    featureCount: 8,
    trainedAt: null,
    sourceName: 'Built-in BRTS dataset',
    uploadedRows: 0
  });

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

  const impactMetrics = useMemo<TransitImpactMetrics>(() => {
    const route9Buses = buses.filter((bus) => bus.routeId === 'ROUTE_9');
    const route12Buses = buses.filter((bus) => bus.routeId === 'ROUTE_12');
    const overloadedBuses = buses.filter((bus) => bus.status === 'CRITICAL_OVERLOAD' || bus.status === 'OVERLOAD').length;
    const lowLoadBuses = buses.filter((bus) => bus.plfPercent < 35 && !bus.isDiverted).length;
    const route9Average = route9Buses.length ? route9Buses.reduce((sum, bus) => sum + bus.plfPercent, 0) / route9Buses.length : 0;
    const route12Average = route12Buses.length ? route12Buses.reduce((sum, bus) => sum + bus.plfPercent, 0) / route12Buses.length : 0;
    const diversionCount = buses.filter((bus) => bus.isDiverted).length;
    const passengerMinutesSaved = Math.round(dprMetrics.wSavedMin * dprMetrics.pWaitingPax * Math.min(1, diversionCount / 2));
    const estimatedFuelLitersAvoided = parseFloat((diversionCount * 4.8).toFixed(1));
    const estimatedCo2KgAvoided = parseFloat((estimatedFuelLitersAvoided * 2.68).toFixed(1));
    const networkBalanceScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(route9Average - route12Average) * 0.7)));
    const resilienceScore = Math.max(0, Math.min(100, Math.round(72 - overloadedBuses * 8 + lowLoadBuses * 5 + diversionCount * 4)));

    return { passengerMinutesSaved, estimatedFuelLitersAvoided, estimatedCo2KgAvoided, networkBalanceScore, resilienceScore, overloadedBuses, lowLoadBuses };
  }, [buses, dprMetrics]);

  const recommendation = useMemo<DispatchRecommendation>(() => {
    const overloadedBuses = buses.filter((bus) => bus.status === 'CRITICAL_OVERLOAD' || bus.status === 'OVERLOAD');
    const availableBuses = buses.filter((bus) => bus.routeId === 'ROUTE_12' && !bus.isDiverted && bus.plfPercent < 35);
    const criticalStops = stops.filter((stop) => stop.rushLevel === 'CRITICAL_SURGE' || stop.rushLevel === 'HIGH_RUSH');

    if (overloadedBuses.length > 0 && availableBuses.length > 0 && dprMetrics.isRecommended) {
      return {
        title: `Dispatch ${availableBuses[0].id} toward Route 9 Express`,
        action: `DIVERT ${availableBuses[0].id}`,
        recommendedBusId: availableBuses[0].id,
        rationale: `${overloadedBuses.length} buses are above capacity while ${availableBuses.length} Route 12 buses remain below 35% load. ${criticalStops.length} stations report elevated demand.`,
        confidence: Math.min(98, 72 + overloadedBuses.length * 4 + availableBuses.length * 3),
        priority: 'HIGH'
      };
    }

    if (overloadedBuses.length > 0) {
      return {
        title: 'Hold a reserve vehicle on Route 9',
        action: 'MONITOR ROUTE 9',
        rationale: `${overloadedBuses.length} buses remain above capacity. No low-load vehicle currently meets the diversion threshold.`,
        confidence: 81,
        priority: 'MEDIUM'
      };
    }

    return {
      title: 'Maintain the current schedule',
      action: 'KEEP SCHEDULE',
      rationale: 'Fleet load is balanced and no immediate diversion threshold is active.',
      confidence: 76,
      priority: 'LOW'
    };
  }, [buses, stops, dprMetrics]);

  // Simulation step loop: micro movement & passenger count dynamics
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const path = getRoutePath(bus.isDiverted ? 'ROUTE_9_EXPRESS' : bus.routeId);
          const currentIndex = Math.min(bus.pathIndex ?? 0, path.length - 1);
          const nextIndex = currentIndex >= path.length - 1 ? 0 : currentIndex + 1;
          const target = path[nextIndex];
          const latitudeStep = (target[0] - bus.lat) * 0.18;
          const longitudeStep = (target[1] - bus.lng) * 0.18;
          const reachedTarget = Math.abs(target[0] - bus.lat) + Math.abs(target[1] - bus.lng) < 0.002;
          const newLat = reachedTarget ? target[0] : bus.lat + latitudeStep;
          const newLng = reachedTarget ? target[1] : bus.lng + longitudeStep;
          const nextPathIndex = reachedTarget ? nextIndex : currentIndex;
          const heading = Math.round((Math.atan2(target[1] - newLng, target[0] - newLat) * 180) / Math.PI);

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
            heading,
            pathIndex: nextPathIndex,
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
            status: 'UNDERUTILIZED',
            pathIndex: 0
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
    setActiveScenario(null);
    setLastAlert('System reset to default initial state.');
  };

  const activateScenario = (scenario: TransitScenario) => {
    const scenarios: Record<TransitScenario, ActiveScenario> = {
      PEAK_SURGE: { type: scenario, label: 'Peak university surge', description: 'Route 9 demand rises sharply around education and employment hubs.' },
      STATION_CLOSURE: { type: scenario, label: 'LD College station closure', description: 'Passengers are redirected to nearby stops while the station is unavailable.' },
      MONSOON_DELAY: { type: scenario, label: 'Monsoon delay', description: 'Reduced speeds and longer platform queues require a resilience response.' }
    };
    setActiveScenario(scenarios[scenario]);

    setBuses((current) => current.map((bus) => {
      if (scenario === 'PEAK_SURGE' && bus.routeId === 'ROUTE_9') {
        const passengers = Math.min(95, bus.currentPassengers + 8);
        return { ...bus, currentPassengers: passengers, plfPercent: parseFloat(((passengers / bus.capacity) * 100).toFixed(1)), status: 'CRITICAL_OVERLOAD' };
      }
      if (scenario === 'MONSOON_DELAY') {
        return { ...bus, speedKmph: Math.max(10, Math.round(bus.speedKmph * 0.7)) };
      }
      return bus;
    }));
    setStops((current) => current.map((stop) => {
      if (scenario === 'STATION_CLOSURE' && stop.id === 'STOP-06') {
        return { ...stop, waitingPassengers: Math.max(5, (stop.waitingPassengers || 0) - 80), rushLevel: 'LOW_RUSH' };
      }
      if (scenario === 'MONSOON_DELAY') {
        const waiting = (stop.waitingPassengers || 0) + 12;
        return { ...stop, waitingPassengers: waiting, rushLevel: waiting > 100 ? 'CRITICAL_SURGE' : waiting > 60 ? 'HIGH_RUSH' : 'MODERATE_RUSH' };
      }
      if (scenario === 'PEAK_SURGE' && (stop.routeId === 'ROUTE_9' || stop.routeId === 'SHARED')) {
        const waiting = (stop.waitingPassengers || 0) + 20;
        return { ...stop, waitingPassengers: waiting, rushLevel: waiting > 100 ? 'CRITICAL_SURGE' : 'HIGH_RUSH' };
      }
      return stop;
    }));
    setLastAlert(`${scenarios[scenario].label} scenario activated.`);
  };

  const clearScenario = () => {
    setBuses(INITIAL_BUSES);
    setStops(AHMEDABAD_STOPS);
    setActiveScenario(null);
    setLastAlert('Scenario cleared. Live baseline restored.');
  };

  const trainLocalModel = (uploadedRows = 0, sourceName = 'Built-in BRTS dataset') => {
    setLocalModel((current) => ({ ...current, status: 'TRAINING' }));

    window.setTimeout(() => {
      const trainingExamples = buses.length + stops.length + dispatchLogs.length + uploadedRows;
      setLocalModel({
        status: 'READY',
        version: `local-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`,
        trainingExamples,
        featureCount: 8,
        trainedAt: new Date().toLocaleTimeString(),
        sourceName,
        uploadedRows
      });
      setLastAlert(`Local dispatch model trained on ${trainingExamples} records from ${sourceName}.`);
    }, 900);
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
        totalRevenueRupees,
        recommendation,
        localModel,
        trainLocalModel,
        impactMetrics,
        activeScenario,
        activateScenario,
        clearScenario
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
