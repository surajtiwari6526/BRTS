import { NextResponse } from 'next/server';
import { INITIAL_BUSES } from '../../../../data/initialDataset';
import { getSupabaseAdminClient } from '../../../../lib/supabase/server';

function mapBusRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    busNumber: row.bus_number as string,
    routeId: row.route_id as string,
    routeName: row.route_name as string,
    currentStop: row.current_stop as string,
    lat: row.latitude as number,
    lng: row.longitude as number,
    heading: row.heading as number,
    speedKmph: row.speed_kmph as number,
    capacity: row.capacity as number,
    currentPassengers: row.current_passengers as number,
    plfPercent: row.plf_percent as number,
    status: row.status as typeof INITIAL_BUSES[number]['status'],
    isDiverted: row.is_diverted as boolean,
    divertedTo: row.diverted_to as string | undefined,
    pathIndex: row.path_index as number | undefined
  };
}

export async function GET() {
  const timestamp = Math.floor(Date.now() / 1000);
  const supabase = getSupabaseAdminClient();
  let buses = INITIAL_BUSES;

  if (supabase) {
    const { data, error } = await supabase.from('buses').select('*').order('id');
    if (!error && data?.length) {
      buses = data.map(mapBusRow);
    }
  }

  const gtfsRtFeed = {
    header: {
      gtfsRealtimeVersion: "2.0",
      incrementality: "FULL_DATASET",
      timestamp: timestamp
    },
    entity: buses.map((bus) => ({
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
    totalBuses: buses.length,
    buses,
    gtfsRt: gtfsRtFeed
  });
}
