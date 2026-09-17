'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Bus } from '../../types/brts';
import { ROUTE_9_POLYLINE, ROUTE_12_POLYLINE, ROUTE_9_EXPRESS_POLYLINE, AHMEDABAD_STOPS } from '../../data/initialDataset';

interface BusMapProps {
  buses: Bus[];
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
  onDivertBus?: (busId: string) => void;
}

// Dynamically import LeafletMapWrapper client-side only to prevent SSR react-leaflet chunk errors
const LeafletMapWrapper = dynamic(() => import('./LeafletMapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-300 bg-slate-100/90 font-mono text-sm text-[#163b64]">
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>INITIALIZING JANMARG BRTS MAP ENGINE...</span>
      </div>
    </div>
  )
});

export const BusMap: React.FC<BusMapProps> = ({
  buses,
  selectedBusId,
  onSelectBus,
  onDivertBus
}) => {
  return (
    <LeafletMapWrapper
      buses={buses}
      stops={AHMEDABAD_STOPS}
      route9Path={ROUTE_9_POLYLINE}
      route12Path={ROUTE_12_POLYLINE}
      route9ExpressPath={ROUTE_9_EXPRESS_POLYLINE}
      selectedBusId={selectedBusId}
      onSelectBus={onSelectBus}
      onDivertBus={onDivertBus}
    />
  );
};
