'use client';
import { useState, useEffect } from 'react'; // Add useEffect import
import Header from './Header';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';

type PageLayoutProps = {
  children: React.ReactNode;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
  showSidebar?: boolean;
  showHeader?: boolean;
  showChatBot?: boolean;
  contentClassName?: string;
};

export function PageLayout({
  children,
  role,
  showSidebar = true,
  showHeader = true,
  showChatBot = true,
  contentClassName = ''
}: PageLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Corrected client-side check using useEffect
  useEffect(() => {
    setIsClient(true);
  }, []); // Empty dependency array runs only once on mount

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          role={role}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Header */}
        {showHeader && (
          <Header toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        )}

        {/* Page Content */}
        <main className={`flex-1 p-4 lg:p-6 ${contentClassName}`}>
          {children}
        </main>
      </div>

      {/* ChatBot */}
      {showChatBot && <ChatBot />}
    </div>
  );
}