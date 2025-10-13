// components/layouts/ManagerLayout.tsx
'use client';
import { PageLayout } from './PageLayout';
//import { managerSidebarItems } from '@/config/navigation';

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout 
      role="manager"
      showSidebar={false}
      showHeader={true}
      contentClassName="max-w-screen-xl mx-auto"
    >
      {children}
    </PageLayout>
  );
}