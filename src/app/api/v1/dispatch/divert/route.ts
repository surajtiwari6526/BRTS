import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { busId, sourceRoute, targetRoute } = body;

    if (!busId) {
      return NextResponse.json(
        { error: 'Missing busId in request body' },
        { status: 400 }
      );
    }

    const assignedTarget = targetRoute || 'ROUTE_9_EXPRESS';

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Bus ${busId} successfully rerouted to ${assignedTarget}`,
      dispatchDirective: {
        busId,
        sourceRoute: sourceRoute || 'ROUTE_12',
        targetRoute: assignedTarget,
        effectiveJunction: 'Nehrunagar Circle BRTS Station',
        estimatedWaitTimeSavedMinutes: 14,
        dprRatio: 3.4,
        netBenefitINR: 4820,
        instructions: `Proceed from Nehrunagar Circle onto Route 9X Express corridor towards LD Engineering College.`
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}
