import { NextRequest, NextResponse } from 'next/server';
import { BRTS_ROUTES } from '../../../../../data/routeCatalog';

const directRoute = BRTS_ROUTES.find((route) => route.routeNo === '3')!;
const transferRoute = BRTS_ROUTES.find((route) => route.routeNo === '12')!;
const transferFare = Math.round(transferRoute.maxFareInr * 0.67);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin') || 'RTO Circle BRTS';
  const destination = searchParams.get('destination') || 'LD Engineering College';

  return NextResponse.json({
    status: 'SUCCESS',
    origin,
    destination,
    timestamp: new Date().toISOString(),
    routes: [
      {
        optionId: 'FASTEST',
        title: 'Option A: Fastest Route Direct',
        corridor: `Route ${directRoute.routeNo} demand corridor`,
        durationMinutes: 18,
        crowdLevel: '98% Rush (Standing Room Only)',
        plfFactor: 112.8,
        standardFareINR: directRoute.maxFareInr,
        finalFareINR: directRoute.maxFareInr,
        hasDiscount: false,
        warning: 'Heavy crowding expected. No vacant seats.'
      },
      {
        optionId: 'COMFORT',
        title: 'Option B: Comfort Choice (Guaranteed Seat)',
        corridor: `Route ${transferRoute.routeNo} + Transfer to Express 9X`,
        durationMinutes: 22,
        crowdLevel: '15% Rush (Guaranteed Seat Available)',
        plfFactor: 18.5,
        standardFareINR: transferRoute.maxFareInr,
        finalFareINR: transferFare,
        discountPercent: 33,
        hasDiscount: true,
        discountToken: `DISCOUNT-TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
        transferGuide: `Board Route ${transferRoute.routeNo} underutilized bus -> Transfer at Nehrunagar Circle -> Express 9X`
      }
    ]
  });
}
