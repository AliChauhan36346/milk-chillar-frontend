'use client';

import { Suspense } from 'react';
import BuyerDetailPageInner from './BuyerDetailPageInner';

export default function BuyerDetailPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6">Loading buyer details...</div>}>
      <BuyerDetailPageInner />
    </Suspense>
  );
}
