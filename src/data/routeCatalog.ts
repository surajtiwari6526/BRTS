export interface FareSlab {
  label: string;
  minKm: number;
  maxKm: number | null;
  fareInr: number;
}

export interface BRTSRoute {
  routeNo: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  totalStops: number;
  intermediateStops: string[];
  minFareInr: number;
  maxFareInr: number;
}

export const FARE_SLABS: FareSlab[] = [
  { label: '0.0 - 2.0 km', minKm: 0, maxKm: 2, fareInr: 5 },
  { label: '2.1 - 5.0 km', minKm: 2.1, maxKm: 5, fareInr: 10 },
  { label: '5.1 - 8.0 km', minKm: 5.1, maxKm: 8, fareInr: 15 },
  { label: '8.1 - 12.0 km', minKm: 8.1, maxKm: 12, fareInr: 20 },
  { label: '12.1 - 16.0 km', minKm: 12.1, maxKm: 16, fareInr: 25 },
  { label: '16.1 - 20.0 km', minKm: 16.1, maxKm: 20, fareInr: 30 },
  { label: 'Above 20.0 km', minKm: 20.1, maxKm: null, fareInr: 35 }
];

export const BRTS_ROUTES: BRTSRoute[] = [
  { routeNo: '1', routeName: 'Ghuma Gam to Maninagar', startPoint: 'Ghuma Gam', endPoint: 'Maninagar', totalStops: 28, intermediateStops: ['Bopal Cross Road', 'ISKCON', 'Shivranjani', 'Nehrunagar', 'Anjali', 'Kankaria Lake'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '2', routeName: 'Bhadaj Circle to Odhav Ring Road', startPoint: 'Bhadaj Circle', endPoint: 'Odhav Ring Road', totalStops: 32, intermediateStops: ['Science City Approach', 'Sola Cross Road', 'Gujarat High Court', 'Delhi Darwaja', 'Kalupur Railway Station'], minFareInr: 5, maxFareInr: 30 },
  { routeNo: '3', routeName: 'RTO Circle to Maninagar', startPoint: 'RTO Circle', endPoint: 'Maninagar', totalStops: 22, intermediateStops: ['Ranip', 'Wadaj', 'Income Tax', 'LD College', 'Nehrunagar', 'Anjali', 'Kankaria'], minFareInr: 5, maxFareInr: 20 },
  { routeNo: '4', routeName: 'LD College to Amba Township', startPoint: 'LD College of Engineering', endPoint: 'Amba Township (Trimandir)', totalStops: 26, intermediateStops: ['University', 'Vijay Cross Road', 'Memnagar', 'Visat Cross Road', 'Chandkheda'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '5', routeName: 'Vasna to Dahegam Circle', startPoint: 'Vasna Terminus', endPoint: 'Dahegam Circle (SP Ring Road)', totalStops: 35, intermediateStops: ['Anjali', 'Narol', 'Isanpur', 'CTM Cross Road', 'Rabari Colony', 'Naroda Patia'], minFareInr: 5, maxFareInr: 30 },
  { routeNo: '6', routeName: 'Narol to Naroda Gam', startPoint: 'Narol', endPoint: 'Naroda Gam', totalStops: 18, intermediateStops: ['Isanpur', 'Ghodasar', 'CTM', 'Rabari Colony', 'Soni Ni Chali', 'Thakkarbapanagar'], minFareInr: 5, maxFareInr: 20 },
  { routeNo: '7', routeName: 'DCIS Circle to Narol', startPoint: 'DCIS Circle (Zundal)', endPoint: 'Narol', totalStops: 30, intermediateStops: ['Chandkheda', 'RTO', 'Wadaj', 'Delhi Darwaja', 'Kalupur', 'Geeta Mandir', 'Chandranagar'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '8', routeName: 'Naroda Gam to Bhadaj Circle', startPoint: 'Naroda Gam', endPoint: 'Bhadaj Circle', totalStops: 36, intermediateStops: ['Naroda Patia', 'Memco', 'Kalupur', 'Income Tax', 'Memnagar', 'Sola', 'Science City'], minFareInr: 5, maxFareInr: 30 },
  { routeNo: '9', routeName: 'Vasantnagar Township to Maninagar', startPoint: 'Vasantnagar Township (Gota)', endPoint: 'Maninagar', totalStops: 27, intermediateStops: ['Gota Cross Road', 'Sola Bridge', 'Memnagar', 'LD College', 'Geeta Mandir'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '11', routeName: 'LD College to Odhav Ring Road', startPoint: 'LD College of Engineering', endPoint: 'Odhav Ring Road', totalStops: 24, intermediateStops: ['Shivranjani', 'Anjali', 'CTM Cross Road', 'Express Highway Junction', 'Odhav'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '12', routeName: 'RTO Circle to CTM Cross Roads', startPoint: 'RTO Circle', endPoint: 'CTM Cross Roads', totalStops: 19, intermediateStops: ['Ranip', 'Subhash Bridge', 'Delhi Darwaja', 'Kalupur', 'Raipur', 'Hatkeshwar'], minFareInr: 5, maxFareInr: 20 },
  { routeNo: '14', routeName: 'Sarkhej Sanand Cross Road to Naroda', startPoint: 'Sarkhej Sanand Cross Road', endPoint: 'Naroda Gam', totalStops: 31, intermediateStops: ['Ujala Circle', 'ISKCON', 'Shivranjani', 'Anjali', 'Kalupur', 'Naroda Patia'], minFareInr: 5, maxFareInr: 30 },
  { routeNo: '15', routeName: 'Iskcon to Airport', startPoint: 'ISKCON Cross Road', endPoint: 'Ahmedabad Domestic Airport', totalStops: 23, intermediateStops: ['Shivranjani', 'Memnagar', 'Sola', 'RTO Circle', 'Camp Hanuman'], minFareInr: 5, maxFareInr: 25 },
  { routeNo: '16', routeName: 'Nehru Nagar to Sarkhej Sanand Road', startPoint: 'Nehru Nagar', endPoint: 'Sarkhej Sanand Cross Road', totalStops: 12, intermediateStops: ['Shivranjani', 'ISKCON', 'SG Highway', 'Sanand Circle'], minFareInr: 5, maxFareInr: 15 },
  { routeNo: '17', routeName: 'Nehru Nagar to South Bopal', startPoint: 'Nehru Nagar', endPoint: 'South Bopal', totalStops: 14, intermediateStops: ['Shivranjani', 'ISKCON', 'Bopal Flyover', 'South Bopal'], minFareInr: 5, maxFareInr: 15 },
  { routeNo: '18', routeName: 'Maninagar to Airport', startPoint: 'Maninagar', endPoint: 'Ahmedabad Domestic Airport', totalStops: 16, intermediateStops: ['Kankaria', 'Geeta Mandir', 'Kalupur', 'Camp Hanuman'], minFareInr: 5, maxFareInr: 20 },
  { routeNo: '101', routeName: 'RTO Circular (Clockwise)', startPoint: 'RTO Circle', endPoint: 'RTO Circle (Circular)', totalStops: 45, intermediateStops: ['RTO', 'Wadaj', 'Income Tax', 'Kalupur', 'Geeta Mandir', 'Anjali', 'Shivranjani', 'Memnagar', 'RTO'], minFareInr: 5, maxFareInr: 35 },
  { routeNo: '201', routeName: 'RTO Circular (Anticlockwise)', startPoint: 'RTO Circle', endPoint: 'RTO Circle (Circular)', totalStops: 45, intermediateStops: ['RTO', 'Memnagar', 'Shivranjani', 'Anjali', 'Geeta Mandir', 'Kalupur', 'Income Tax', 'Wadaj', 'RTO'], minFareInr: 5, maxFareInr: 35 }
];

export function fareForDistance(distanceKm: number): FareSlab {
  const safeDistance = Math.max(0, distanceKm);
  return FARE_SLABS.find((slab) => safeDistance <= (slab.maxKm ?? Number.POSITIVE_INFINITY)) ?? FARE_SLABS[FARE_SLABS.length - 1];
}
