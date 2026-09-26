'use client';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';
import { 
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Scale,
  FileText,
  Wallet,
  Users,
  BarChart2,
  Package,
  Settings
} from 'lucide-react';

const managerNavigation = [
  {
    section: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard/manager',
        icon: <LayoutDashboard size={20} />
      }
    ]
  },
  {
    section: 'Operations',
    items: [
      {
        label: 'Sales',
        href: '/Sales',
        icon: <ShoppingCart size={20} />
      },
      {
        label: 'Purchase',
        href: '/Purchase/SimplePurchase',
        icon: <ShoppingBag size={20} />
      },
      {
        label: 'Receive',
        href: '/chillarReceive',
        icon: <Truck size={20} />
      }
    ]
  },
  {
    section: 'Reports',
    items: [
      {
        label: 'Sales Report',
        href: '/reports/saleReport',
        icon: <BarChart2 size={20} />
      },
      {
        label: 'Purchase Report',
        href: '/reports/dodhiPurchaseReport',
        icon: <FileText size={20} />
      },
      {
        label: 'Receive Report',
        href: '/reports/receive',
        icon: <Scale size={20} />
      }
    ]
  },
  {
    section: 'Finance',
    items: [
      {
        label: 'Accounts',
        href: '/Accounts',
        icon: <Wallet size={20} />
      }
    ]
  },
  {
    section: 'Management',
    items: [
      {
        label: 'Buyers',
        href: '/Buyers',
        icon: <Users size={20} />
      },
      {
        label: 'Suppliers',
        href: '/Suppliers',
        icon: <Package size={20} />
      },
      {
        label: 'Settings',
        href: '/System',
        icon: <Settings size={20} />
      }
    ]
  }
];

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
        navigation={managerNavigation}
      />

      <div className="flex-1 flex flex-col bg-gray-50">
        <Header toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      <ChatBot />
    </div>
  );
}













