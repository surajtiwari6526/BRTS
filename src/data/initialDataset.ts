import { Bus, BRTSStop } from '../types/brts';
import { BRTS_ROUTES } from './routeCatalog';
import { getRoutePath } from './routePaths';

export const INITIAL_BUSES: Bus[] = [
  {
    "id": "BUS-901",
    "busNumber": "GJ-01-BX-1001",
    "routeId": "ROUTE_9",
    "routeName": "RTO Circle to LD College",
    "currentStop": "LD Engineering College",
    "lat": 23.0338,
    "lng": 72.5468,
    "heading": 85,
    "speedKmph": 28,
    "capacity": 70,
    "currentPassengers": 82,
    "plfPercent": 117.1,
    "status": "CRITICAL_OVERLOAD",
    "isDiverted": false
  },
  {
    "id": "BUS-902",
    "busNumber": "GJ-01-BX-1002",
    "routeId": "ROUTE_9",
    "routeName": "RTO Circle to LD College",
    "currentStop": "Gujarat University",
    "lat": 23.0364,
    "lng": 72.5452,
    "heading": 92,
    "speedKmph": 22,
    "capacity": 70,
    "currentPassengers": 79,
    "plfPercent": 112.8,
    "status": "CRITICAL_OVERLOAD",
    "isDiverted": false
  },
  {
    "id": "BUS-903",
    "busNumber": "GJ-01-BX-1003",
    "routeId": "ROUTE_9",
    "routeName": "RTO Circle to LD College",
    "currentStop": "Panjrapole Char Rasta",
    "lat": 23.0232,
    "lng": 72.5429,
    "heading": 178,
    "speedKmph": 18,
    "capacity": 70,
    "currentPassengers": 74,
    "plfPercent": 105.7,
    "status": "OVERLOAD",
    "isDiverted": false
  },
  {
    "id": "BUS-904",
    "busNumber": "GJ-01-BX-1004",
    "routeId": "ROUTE_9",
    "routeName": "RTO Circle to LD College",
    "currentStop": "Gulbai Tekra Approach",
    "lat": 23.0275,
    "lng": 72.5478,
    "heading": 45,
    "speedKmph": 31,
    "capacity": 70,
    "currentPassengers": 69,
    "plfPercent": 98.5,
    "status": "NEAR_CAPACITY",
    "isDiverted": false
  },
  {
    "id": "BUS-905",
    "busNumber": "GJ-01-BX-1005",
    "routeId": "ROUTE_9",
    "routeName": "RTO Circle to LD College",
    "currentStop": "Jaimangal BRTS",
    "lat": 23.0611,
    "lng": 72.5489,
    "heading": 180,
    "speedKmph": 34,
    "capacity": 70,
    "currentPassengers": 71,
    "plfPercent": 101.4,
    "status": "OVERLOAD",
    "isDiverted": false
  },
  {
    "id": "BUS-1201",
    "busNumber": "GJ-01-CZ-2001",
    "routeId": "ROUTE_12",
    "routeName": "RTO Circle to CTM Cross Road",
    "currentStop": "Nehrunagar Circle",
    "lat": 23.0188,
    "lng": 72.5394,
    "heading": 210,
    "speedKmph": 36,
    "capacity": 70,
    "currentPassengers": 11,
    "plfPercent": 15.7,
    "status": "UNDERUTILIZED",
    "isDiverted": true,
    "divertedTo": "ROUTE_9_EXPRESS"
  },
  {
    "id": "BUS-1202",
    "busNumber": "GJ-01-CZ-2002",
    "routeId": "ROUTE_12",
    "routeName": "RTO Circle to CTM Cross Road",
    "currentStop": "Anjali Cross Road",
    "lat": 23.0039,
    "lng": 72.5512,
    "heading": 130,
    "speedKmph": 29,
    "capacity": 70,
    "currentPassengers": 14,
    "plfPercent": 20.0,
    "status": "UNDERUTILIZED",
    "isDiverted": false
  },
  {
    "id": "BUS-1203",
    "busNumber": "GJ-01-CZ-2003",
    "routeId": "ROUTE_12",
    "routeName": "RTO Circle to CTM Cross Road",
    "currentStop": "Maninagar Railway Station",
    "lat": 22.9978,
    "lng": 72.6021,
    "heading": 315,
    "speedKmph": 24,
    "capacity": 70,
    "currentPassengers": 19,
    "plfPercent": 27.1,
    "status": "LOW_RUSH",
    "isDiverted": false
  },
  {
    "id": "BUS-1204",
    "busNumber": "GJ-01-CZ-2004",
    "routeId": "ROUTE_12",
    "routeName": "RTO Circle to CTM Cross Road",
    "currentStop": "Danilimda Cross Road",
    "lat": 22.9936,
    "lng": 72.5794,
    "heading": 90,
    "speedKmph": 33,
    "capacity": 70,
    "currentPassengers": 16,
    "plfPercent": 22.8,
    "status": "UNDERUTILIZED",
    "isDiverted": false
  },
  {
    "id": "BUS-1205",
    "busNumber": "GJ-01-CZ-2005",
    "routeId": "ROUTE_12",
    "routeName": "RTO Circle to CTM Cross Road",
    "currentStop": "Kankaria East",
    "lat": 23.0062,
    "lng": 72.6028,
    "heading": 0,
    "speedKmph": 27,
    "capacity": 70,
    "currentPassengers": 8,
    "plfPercent": 11.4,
    "status": "UNDERUTILIZED",
    "isDiverted": true,
    "divertedTo": "ROUTE_9_EXPRESS"
  }
];

// Keep a small, deterministic operating fleet on every published route so
// route analytics and dispatch can exercise the complete network.
const GENERATED_ROUTE_BUSES: Bus[] = BRTS_ROUTES
  .filter((route) => !INITIAL_BUSES.some((bus) => bus.routeId === `ROUTE_${route.routeNo}`))
  .flatMap((route, routeIndex) => [0, 1].map((vehicleIndex) => {
    const passengers = 24 + ((routeIndex * 11 + vehicleIndex * 13) % 42);
    const capacity = 70;
    const plfPercent = parseFloat(((passengers / capacity) * 100).toFixed(1));
    const status = plfPercent >= 85 ? 'NEAR_CAPACITY' : plfPercent < 30 ? 'UNDERUTILIZED' : 'LOW_RUSH';
    const path = getRoutePath(`ROUTE_${route.routeNo}`);
    const position = path[Math.min(vehicleIndex * Math.max(1, Math.floor(path.length / 2)), path.length - 1)];
    const nextPosition = path[Math.min(vehicleIndex + 1, path.length - 1)];
    return {
      id: `BUS-${String(2000 + routeIndex * 10 + vehicleIndex).padStart(4, '0')}`,
      busNumber: `GJ-01-R${String(routeIndex + 1).padStart(2, '0')}-${String(vehicleIndex + 1).padStart(4, '0')}`,
      routeId: `ROUTE_${route.routeNo}`,
      routeName: route.routeName,
      currentStop: vehicleIndex === 0 ? route.startPoint : route.intermediateStops[0] || route.endPoint,
      lat: position[0],
      lng: position[1],
      heading: Math.round((Math.atan2(nextPosition[1] - position[1], nextPosition[0] - position[0]) * 180) / Math.PI),
      speedKmph: 22 + ((routeIndex * 5 + vehicleIndex * 7) % 18),
      capacity,
      currentPassengers: passengers,
      plfPercent,
      status,
      isDiverted: false
      ,pathIndex: Math.min(vehicleIndex * Math.max(1, Math.floor(path.length / 2)), path.length - 1)
    } satisfies Bus;
  }));

INITIAL_BUSES.push(...GENERATED_ROUTE_BUSES);

// Keep the seeded demo fleet on the same geometry rendered by the map.
INITIAL_BUSES.forEach((bus, index) => {
  const path = getRoutePath(bus.isDiverted ? 'ROUTE_9_EXPRESS' : bus.routeId);
  const pathIndex = bus.pathIndex ?? index % path.length;
  const position = path[pathIndex % path.length];
  bus.lat = position[0];
  bus.lng = position[1];
  bus.pathIndex = pathIndex % path.length;
});

export const AHMEDABAD_STOPS: BRTSStop[] = [
  { id: 'STOP-01', name: 'RTO Circle', lat: 23.0664, lng: 72.5642, routeId: 'SHARED', ticketsSoldLastHour: 540, waitingPassengers: 145, rushLevel: 'CRITICAL_SURGE' },
  { id: 'STOP-02', name: 'Ranip BRTS', lat: 23.0782, lng: 72.5750, routeId: 'ROUTE_9', ticketsSoldLastHour: 320, waitingPassengers: 82, rushLevel: 'HIGH_RUSH' },
  { id: 'STOP-03', name: 'Jaimangal BRTS', lat: 23.0611, lng: 72.5489, routeId: 'ROUTE_9', ticketsSoldLastHour: 410, waitingPassengers: 110, rushLevel: 'CRITICAL_SURGE' },
  { id: 'STOP-04', name: 'Sola Cross Road', lat: 23.0489, lng: 72.5398, routeId: 'ROUTE_9', ticketsSoldLastHour: 290, waitingPassengers: 68, rushLevel: 'HIGH_RUSH' },
  { id: 'STOP-05', name: 'Gujarat University', lat: 23.0364, lng: 72.5452, routeId: 'ROUTE_9', ticketsSoldLastHour: 380, waitingPassengers: 95, rushLevel: 'HIGH_RUSH' },
  { id: 'STOP-06', name: 'LD Engineering College', lat: 23.0338, lng: 72.5468, routeId: 'ROUTE_9', ticketsSoldLastHour: 460, waitingPassengers: 125, rushLevel: 'CRITICAL_SURGE' },
  { id: 'STOP-07', name: 'Gulbai Tekra Approach', lat: 23.0275, lng: 72.5478, routeId: 'ROUTE_9', ticketsSoldLastHour: 210, waitingPassengers: 48, rushLevel: 'MODERATE_RUSH' },
  { id: 'STOP-08', name: 'Panjrapole Char Rasta', lat: 23.0232, lng: 72.5429, routeId: 'ROUTE_9', ticketsSoldLastHour: 195, waitingPassengers: 40, rushLevel: 'MODERATE_RUSH' },
  { id: 'STOP-09', name: 'Nehrunagar Circle', lat: 23.0188, lng: 72.5394, routeId: 'ROUTE_12', ticketsSoldLastHour: 250, waitingPassengers: 56, rushLevel: 'MODERATE_RUSH' },
  { id: 'STOP-10', name: 'Anjali Cross Road', lat: 23.0039, lng: 72.5512, routeId: 'ROUTE_12', ticketsSoldLastHour: 85, waitingPassengers: 14, rushLevel: 'LOW_RUSH' },
  { id: 'STOP-11', name: 'Danilimda Cross Road', lat: 22.9936, lng: 72.5794, routeId: 'ROUTE_12', ticketsSoldLastHour: 65, waitingPassengers: 12, rushLevel: 'LOW_RUSH' },
  { id: 'STOP-12', name: 'Kankaria East', lat: 23.0062, lng: 72.6028, routeId: 'ROUTE_12', ticketsSoldLastHour: 45, waitingPassengers: 8, rushLevel: 'LOW_RUSH' },
  { id: 'STOP-13', name: 'Maninagar Railway Station', lat: 22.9978, lng: 72.6021, routeId: 'ROUTE_12', ticketsSoldLastHour: 140, waitingPassengers: 28, rushLevel: 'MODERATE_RUSH' },
  { id: 'STOP-14', name: 'CTM Cross Road', lat: 22.9912, lng: 72.6310, routeId: 'ROUTE_12', ticketsSoldLastHour: 75, waitingPassengers: 16, rushLevel: 'LOW_RUSH' }
];

export const ROUTE_9_POLYLINE: [number, number][] = [
  [23.0664, 72.5642], // RTO Circle
  [23.0782, 72.5750], // Ranip
  [23.0611, 72.5489], // Jaimangal
  [23.0489, 72.5398], // Sola
  [23.0364, 72.5452], // University
  [23.0338, 72.5468], // LD College
  [23.0275, 72.5478], // Gulbai Tekra
  [23.0232, 72.5429]  // Panjrapole
];

export const ROUTE_12_POLYLINE: [number, number][] = [
  [23.0664, 72.5642], // RTO Circle
  [23.0188, 72.5394], // Nehrunagar
  [23.0039, 72.5512], // Anjali
  [22.9936, 72.5794], // Danilimda
  [23.0062, 72.6028], // Kankaria East
  [22.9978, 72.6021], // Maninagar
  [22.9912, 72.6310]  // CTM Cross Road
];

export const ROUTE_9_EXPRESS_POLYLINE: [number, number][] = [
  [23.0188, 72.5394], // Nehrunagar
  [23.0232, 72.5429], // Panjrapole
  [23.0275, 72.5478], // Gulbai Tekra
  [23.0338, 72.5468], // LD College
  [23.0364, 72.5452], // University
  [23.0611, 72.5489]  // Jaimangal
];
