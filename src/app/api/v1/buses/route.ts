import { NextResponse } from 'next/server';
import { INITIAL_BUSES } from '../../../../data/initialDataset';

export async function GET() {
  const timestamp = Math.floor(Date.now() / 1000);

  const gtfsRtFeed = {
    header: {
      gtfsRealtimeVersion: "2.0",
      incrementality: "FULL_DATASET",
      timestamp: timestamp
    },
    entity: INITIAL_BUSES.map((bus) => ({
      id: bus.id,
      vehicle: {
        trip: {
          tripId: `TRIP-${bus.routeId}-${bus.id}`,
          routeId: bus.isDiverted ? 'ROUTE_9_EXPRESS' : bus.routeId
        },
        position: {
          latitude: bus.lat,
          longitude: bus.lng,
          bearing: bus.heading,
          speed: bus.speedKmph / 3.6 // convert km/h to m/s
        },
        currentStopSequence: 4,
        currentStatus: "IN_TRANSIT_TO",
        stopId: bus.currentStop,
        vehicle: {
          id: bus.id,
          label: bus.busNumber
        }
      }
    }))
  };

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    totalBuses: INITIAL_BUSES.length,
    buses: INITIAL_BUSES,
    gtfsRt: gtfsRtFeed
  });
}
