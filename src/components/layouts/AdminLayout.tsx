'use client';
import { PageLayout } from './PageLayout';
//import { adminSidebarItems } from '@/config/navigation';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout
      role="admin"
      showSidebar={true}
      showHeader={true}
      showChatBot={false} // Admins might not need chatbot
      //contentClassName="max-w-screen-2xl mx-auto"
    >
      {children}
    </PageLayout>
  );
}