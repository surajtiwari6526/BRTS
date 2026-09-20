import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/server';

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
    const supabase = getSupabaseAdminClient();

    if (supabase) {
      const { data: updatedBus } = await supabase
        .from('buses')
        .update({
          is_diverted: true,
          diverted_to: assignedTarget,
          status: 'UNDERUTILIZED',
          path_index: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', busId)
        .select('id, bus_number, route_id')
        .maybeSingle();

      if (updatedBus) {
        await supabase.from('dispatch_logs').insert({
          id: `LOG-${Date.now()}`,
          bus_id: updatedBus.id,
          bus_number: updatedBus.bus_number,
          source_route: sourceRoute || updatedBus.route_id,
          target_route: assignedTarget,
          dpr: 3.4,
          benefit_inr: 4820
        });
      }
    }

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
