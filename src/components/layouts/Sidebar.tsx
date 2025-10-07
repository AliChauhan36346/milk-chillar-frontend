'use client';
import { useState } from 'react';
import { 
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Scale,
  FileText,
  Wallet,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Users,
  BarChart2,
  Package,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

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

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
  navigation: NavigationSection[];
};

export default function Sidebar({ 
  isCollapsed, 
  toggleSidebar,
  role,
  navigation
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <aside className={clsx(
      'h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Header with toggle button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">MC</span>
          </div>
        ) : (
          <h2 className="text-lg font-bold text-blue-600">MilkChillar</h2>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map(({ section, items }) => (
          <div key={section} className="mb-6">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">
                {section}
              </p>
            )}
            
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.subItems && item.subItems.some(subItem => pathname === subItem.href));
                
                if (item.subItems) {
                  const sectionKey = item.label.toLowerCase().replace(/\s+/g, '-');
                  const isExpanded = expandedSections[sectionKey] ?? true;
                  
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleSection(sectionKey)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                          'hover:bg-blue-50 text-gray-700',
                          isActive && 'bg-blue-50 text-blue-600 font-medium'
                        )}
                      >
                        <span className={clsx(
                          'flex items-center justify-center min-w-[24px]',
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        )}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </>
                        )}
                      </button>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={clsx(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'hover:bg-blue-50 text-gray-700',
                                pathname === subItem.href && 'bg-blue-100 text-blue-600 font-medium'
                              )}
                            >
                              <span className="text-gray-500">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      'hover:bg-blue-50 text-gray-700',
                      isActive && 'bg-blue-100 text-blue-600 font-medium'
                    )}
                  >
                    <span className={clsx(
                      'flex items-center justify-center min-w-[24px]',
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    )}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {role?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium capitalize">{role}</p>
              <p className="text-xs text-gray-500">{role}@milkchillar.com</p>
            </div>
          )}
        </div>
      </div> */}
    </aside>
  );
}