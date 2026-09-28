// app/Accounts/createAccount/page.tsx
'use client';

import { Suspense } from 'react';
import { FullPageSpinner } from '@/components/ui/spinner';
import CreateAccountPageInner from './CreateAccountPageInner';

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<FullPageSpinner message="Loading account form..." />}>
      <CreateAccountPageInner />
    </Suspense>
  );
}
