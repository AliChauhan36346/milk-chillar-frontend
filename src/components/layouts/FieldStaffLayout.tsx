// components/layouts/FieldStaffLayout.tsx
'use client';
import { useState } from 'react';
import Header from '@/components/layouts/Header';
import DodhiNav from '@/components/ui/DodhiNav';
import ChillarNav from '@/components/ui/ChillarNav';

export function FieldStaffLayout({ 
  children,
  role 
}: { 
  children: React.ReactNode;
  role: 'dodhi' | 'chillarIncharge';
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const title = role === 'dodhi' ? 'Dodhi Dashboard' : 'Chillar Dashboard';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Use existing Header component */}
      <Header 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        {/* Page Title */}
        {/*<h1 className="text-xl font-bold text-blue-600 mb-4">{title}</h1>*/}
        {children}
      </main>

      {/* Conditionally render the appropriate navigation */}
      {role === 'dodhi' ? <DodhiNav /> : <ChillarNav />}
    </div>
  );
}