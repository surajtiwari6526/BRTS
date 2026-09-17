export type BusStatus = 'CRITICAL_OVERLOAD' | 'OVERLOAD' | 'NEAR_CAPACITY' | 'UNDERUTILIZED' | 'LOW_RUSH';

export interface Bus {
  id: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  currentStop: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmph: number;
  capacity: number;
  currentPassengers: number;
  plfPercent: number;
  status: BusStatus;
  isDiverted: boolean;
  divertedTo?: string;
  pathIndex?: number;
}

export type RushLevel = 'CRITICAL_SURGE' | 'HIGH_RUSH' | 'MODERATE_RUSH' | 'LOW_RUSH';

export interface BRTSStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routeId: string;
  ticketsSoldLastHour?: number;
  waitingPassengers?: number;
  rushLevel?: RushLevel;
}

export interface StationTicketingData {
  stopId: string;
  stationName: string;
  routeId: string;
  ticketsSoldLastHour: number;
  totalRevenueRupees: number;
  waitingPassengers: number;
  rushLevel: RushLevel;
  qrSmartPassPct: number;
  paperTicketPct: number;
}

export interface RouteTicketingSummary {
  routeId: string;
  routeName: string;
  totalTicketsSold: number;
  totalRevenue: number;
  avgWaitTimeMin: number;
  surgeStatus: 'HIGH SURGE (OVERLOAD)' | 'LOW DEMAND' | 'MODERATE';
}

export interface DPRMetrics {
  wSavedMin: number;
  pWaitingPax: number;
  cDeadheadRupees: number;
  dRoute12DelayRupees: number;
  netBenefitRupees: number;
  dprRatio: number;
  isRecommended: boolean;
}

export interface RouteFleetOptimization {
  routeId: string;
  routeName: string;
  totalActiveBuses: number;
  totalPassengersOnRoute: number;
  avgPlfPercent: number;
  requiredBusesCount: number;
  excessBusesCount: number;
  emptyBuses: Bus[];
  recommendationText: string;
}

export interface DispatchLog {
  id: string;
  timestamp: string;
  busId: string;
  busNumber: string;
  sourceRoute: string;
  targetRoute: string;
  dpr: number;
  benefit: number;
}

export interface DispatchRecommendation {
  title: string;
  action: string;
  recommendedBusId?: string;
  rationale: string;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LocalModelState {
  status: 'READY' | 'TRAINING';
  version: string;
  trainingExamples: number;
  featureCount: number;
  trainedAt: string | null;
  sourceName: string;
  uploadedRows: number;
}

export interface TransitImpactMetrics {
  passengerMinutesSaved: number;
  estimatedFuelLitersAvoided: number;
  estimatedCo2KgAvoided: number;
  networkBalanceScore: number;
  resilienceScore: number;
  overloadedBuses: number;
  lowLoadBuses: number;
}

export type TransitScenario = 'PEAK_SURGE' | 'STATION_CLOSURE' | 'MONSOON_DELAY';

export interface ActiveScenario {
  type: TransitScenario;
  label: string;
  description: string;
}
