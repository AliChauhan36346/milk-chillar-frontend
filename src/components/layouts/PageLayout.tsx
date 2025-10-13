// 'use client';
// import { useState, useEffect } from 'react';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import ChatBot from './ChatBot';

// type NavigationItem = {
//   label: string;
//   href: string;
//   icon: React.ReactNode;
//   subItems?: NavigationItem[];
// };

// type NavigationSection = {
//   section: string;
//   items: NavigationItem[];
// };

// type PageLayoutProps = {
//   children: React.ReactNode;
//   role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
//   showSidebar?: boolean;
//   showHeader?: boolean;
//   showChatBot?: boolean;
//   contentClassName?: string;
//   navigation?: NavigationSection[];
//   isSidebarCollapsed?: boolean;
//   toggleSidebar?: () => void;
// };

// export function PageLayout({ 
//   children, 
//   role,
//   showSidebar = true,
//   showHeader = true,
//   showChatBot = true,
//   contentClassName = '',
//   navigation = [],
//   isSidebarCollapsed = false,
//   toggleSidebar = () => {}
// }: PageLayoutProps) {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) return null;

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {showSidebar && (
//         <Sidebar
//           role={role}
//           isCollapsed={isSidebarCollapsed}
//           toggleSidebar={toggleSidebar}
//           navigation={navigation}
//         />
//       )}

//       <div className="flex-1 flex flex-col">
//         {showHeader && (
//           <Header 
//             toggleSidebar={toggleSidebar}
//             role={role}
//           />
//         )}
        
//         <main className={`flex-1 p-4 lg:p-6 ${contentClassName}`}>
//           {children}
//         </main>
//       </div>

//       {showChatBot && <ChatBot />}
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavigationItem[];
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
};

type PageLayoutProps = {
  children: React.ReactNode;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
  showSidebar?: boolean;
  showHeader?: boolean;
  showChatBot?: boolean;
  contentClassName?: string;
  navigation?: NavigationSection[];
  isSidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
};

export function PageLayout({ 
  children, 
  role,
  showSidebar = true,
  showHeader = true,
  showChatBot = true,
  contentClassName = '',
  navigation = [],
  isSidebarCollapsed = false,
  toggleSidebar = () => {}
}: PageLayoutProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Only render if showSidebar is true */}
      {showSidebar && (
        <Sidebar
          role={role}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          navigation={navigation}
        />
      )}

      {/* Main content area - adjust width based on sidebar visibility */}
      <div className={`flex-1 flex flex-col ${showSidebar ? '' : 'w-full'}`}>
        {showHeader && (
          <Header 
            toggleSidebar={toggleSidebar}
            role={role}
          />
        )}
        
        <main className={`flex-1 p-4 lg:p-6 ${contentClassName}`}>
          {children}
        </main>
      </div>

      {showChatBot && <ChatBot />}
    </div>
  );
}