'use client';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';

export default function DashboardLayout({ children, role }: {
  children: React.ReactNode;
  role?: 'admin' | 'manager';
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={role}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />


      <div className="flex-1 flex flex-col bg-gray-50">
        <Header toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      <ChatBot />
    </div>
  );
}













