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
  Package
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: MenuItem[];
};

type MenuSection = {
  section: string;
  items: MenuItem[];
};

export default function Sidebar({ 
  isCollapsed, 
  toggleSidebar,
  role
}: { 
  isCollapsed: boolean;
  toggleSidebar: () => void;
  role?: 'admin' | 'manager';
}){
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    reports: true,
    transactions: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const managerSections: MenuSection[] = [
    {
      section: 'Navigation',
      items: [
        { label: 'Dashboard', href: '/dashboard/manager', icon: <LayoutDashboard size={18} /> },
        {
          label: 'Quick Actions', 
          href: '#',
          icon: <Home size={18} />,
          subItems: [
            { label: 'Add Purchase', href: '/purchase/SimplePurchase', icon: <ShoppingCart size={16} /> },
            { label: 'Add Sales', href: '/sales', icon: <ShoppingBag size={16} /> },
            { label: 'Record Receive', href: '/chillarReceive', icon: <Truck size={16} /> },
            { label: 'Add Payment', href: '/payments/add', icon: <Wallet size={16} /> },
          ]
        }
      ]
    },
    {
      section: 'Management',
      items: [
        { label: 'Dodhi Management', href: '/dodhis', icon: <Users size={18} /> },
        { label: 'Buyer Management', href: '/buyers', icon: <ShoppingBag size={18} /> },
        { label: 'Stock Management', href: '/stock', icon: <Package size={18} /> },
      ]
    }
  ];
  
  const adminSections: MenuSection[] = [
    {
      section: 'Navigation',
      items: [
        { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> }
      ]
    },
    {
      section: 'Reports',
      items: [
        {
          label: 'All Reports', 
          href: '#',
          icon: <FileText size={18} />,
          subItems: [
            { label: 'Purchase Report', href: '/reports/purchase', icon: <ShoppingCart size={16} /> },
            { label: 'Sales Report', href: '/reports/sales', icon: <ShoppingBag size={16} /> },
            { label: 'Receive Report', href: '/reports/receive', icon: <Truck size={16} /> },
            { label: 'Stock Report', href: '/reports/stock', icon: <Package size={16} /> },
            { label: 'Financial Report', href: '/reports/financial', icon: <BarChart2 size={16} /> },
          ]
        }
      ]
    }
  ];
  
  const sections = role === 'admin' ? adminSections : managerSections;
  

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
      <nav className="flex-1 overflow-y-auto p-4">
        {sections.map(({ section, items }) => (
          <div key={section} className="mb-6">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {section}
              </p>
            )}
            
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.subItems && item.subItems.some(subItem => pathname === subItem.href));
                
                if (item.subItems) {
                  const isExpanded = expandedSections[item.label.toLowerCase().replace(' ', '-')] ?? true;
                  
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleSection(item.label.toLowerCase().replace(' ', '-'))}
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
                      
                      {!isCollapsed && isExpanded && (
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

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">M</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium">Manager</p>
              <p className="text-xs text-gray-500">manager@milkchillar.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}