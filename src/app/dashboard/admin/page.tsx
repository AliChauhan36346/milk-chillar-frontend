// // app/dashboard/admin/page.tsx
// 'use client';
// import { AdminLayout } from '@/components/layouts/AdminLayout'; // Update import path
// import { Card, CardContent } from '@/components/ui/card';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import { Line, Pie } from 'react-chartjs-2';
// import Link from 'next/link';
// import { Banknote, Building, Receipt, BookOpen, Clock } from 'lucide-react';
// import {
//   Chart,
//   CategoryScale,
//   LinearScale,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend
// } from 'chart.js';

// // Register required Chart.js components
// Chart.register(
//   CategoryScale,
//   LinearScale,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend
// );

// export default function AdminDashboard() {
//   return (
//     <ProtectedRoute requiredRole="admin">
//       <AdminLayout>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {[
//             {
//               label: 'Cash Balance',
//               value: 'PKR 850K',
//               change: '+15K today',
//               icon: <Banknote className="w-6 h-6" />,
//               bg: 'bg-blue-50',
//               text: 'text-blue-600'
//             },
//             {
//               label: 'Bank Balance',
//               value: 'PKR 2.1M',
//               change: '+120K today',
//               icon: <Building className="w-6 h-6" />,
//               bg: 'bg-purple-50',
//               text: 'text-purple-600'
//             },
//             {
//               label: 'Pending Payments',
//               value: 'PKR 450K',
//               change: '12 suppliers',
//               icon: <Clock className="w-6 h-6" />,
//               bg: 'bg-amber-50',
//               text: 'text-amber-600'
//             },
//             {
//               label: 'Due Receipts',
//               value: 'PKR 380K',
//               change: '8 buyers',
//               icon: <Receipt className="w-6 h-6" />,
//               bg: 'bg-green-50',
//               text: 'text-green-600'
//             },
//           ].map((item) => (
//             <Card key={item.label} className={`${item.bg} shadow-sm`}>
//               <CardContent className="p-4 flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">{item.label}</p>
//                   <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
//                   <span className="text-xs text-gray-500">{item.change}</span>
//                 </div>
//                 <span className="text-2xl">{item.icon}</span>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Quick Actions */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Link href="/Accounts/transactions/cashPayments">
//               <Card className="bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <Banknote className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Cash Payment</h4>
//                       <p className="text-sm text-gray-600">Record cash transactions</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>

//             <Link href="/Accounts/transactions/bank">
//               <Card className="bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-purple-100 rounded-lg">
//                       <Building className="w-5 h-5 text-purple-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Bank Payment</h4>
//                       <p className="text-sm text-gray-600">Record bank transactions</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>

//             <Link href="/Accounts/transactions/receipts">
//               <Card className="bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-green-100 rounded-lg">
//                       <Receipt className="w-5 h-5 text-green-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Receipts</h4>
//                       <p className="text-sm text-gray-600">incoming payments</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>

//             <Link href="/Accounts/accountLedger">
//               <Card className="bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-orange-100 rounded-lg">
//                       <BookOpen className="w-5 h-5 text-orange-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Ledger</h4>
//                       <p className="text-sm text-gray-600">View account statements</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Loss Analysis Pie Chart */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <h3 className="font-semibold mb-4">Loss Breakdown</h3>
//             <Pie
//               data={{
//                 labels: ['Chillar Loss', 'Purchase Loss', 'TS Loss', 'Storage Loss'],
//                 datasets: [{
//                   data: [45, 30, 15, 10],
//                   backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
//                   borderWidth: 0,
//                 }]
//               }}
//               options={{
//                 plugins: {
//                   legend: { position: 'bottom' },
//                   tooltip: { enabled: true }
//                 }
//               }}
//             />
//           </div>

//           {/* Financial Trend Line Chart */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <h3 className="font-semibold mb-4">Financial Trends</h3>
//             <Line
//               data={{
//                 labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
//                 datasets: [
//                   {
//                     label: 'Revenue',
//                     data: [45, 52, 60, 55, 70],
//                     borderColor: '#10B981',
//                     tension: 0.3,
//                     fill: false
//                   },
//                   {
//                     label: 'Expenses',
//                     data: [30, 40, 35, 45, 50],
//                     borderColor: '#EF4444',
//                     tension: 0.3,
//                     fill: false
//                   }
//                 ]
//               }}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { position: 'bottom' }
//                 },
//                 scales: {
//                   y: { beginAtZero: true }
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </AdminLayout>
//     </ProtectedRoute>
//   );
// }


'use client';
import { AdminLayout } from '@/components/layouts/AdminLayout'; // Update import path
import { Card, CardContent } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { Line, Pie } from 'react-chartjs-2';
import Link from 'next/link';
import { Banknote, Building, Receipt, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { CenteredSpinner } from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import { fetchAdminDashboardStats, AdminDashboardStats } from '@/lib/api/reports';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// Helper function to format change with sign
const formatChange = (amount: number, count?: number): string => {
  const sign = amount >= 0 ? '+' : '';
  const formattedAmount = Math.abs(amount) >= 1000 
    ? `${sign}${(amount / 1000).toFixed(0)}K`
    : `${sign}${amount.toFixed(0)}`;
  
  if (count !== undefined) {
    return `${formattedAmount} (${count} ${count === 1 ? 'account' : 'accounts'})`;
  }
  return `${formattedAmount} today`;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  // Helper function to render stats cards during loading/error
  const renderStatsCards = () => {
    if (loading) {
      return dashboardCards.map((item) => (
        <Card key={item.label} className={`${item.bg} shadow-sm`}>
          <CardContent className="p-4 flex items-center justify-center min-h-[96px]">
            <CenteredSpinner size="md" />
          </CardContent>
        </Card>
      ));
    }

    if (error) {
      return dashboardCards.map((item) => (
        <Card key={item.label} className="bg-red-50 shadow-sm">
          <CardContent className="p-2 flex items-center justify-between min-h-[96px]">
            <div>
              <p className="text-sm text-gray-600 mb-1">{item.label}</p>
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Failed to load</span>
              </div>
            </div>
            <span className="text-2xl">{item.icon}</span>
          </CardContent>
        </Card>
      ));
    }

    return dashboardCards.map((item) => (
      <Card key={item.label} className={`${item.bg} shadow-sm`}>
        <CardContent className="px-4 py-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
            <span className="text-xs text-gray-500">{item.change}</span>
          </div>
          <span className="text-2xl">{item.icon}</span>
        </CardContent>
      </Card>
    ));
  };

  const dashboardCards = [
    {
      label: 'Cash Balance',
      value: stats?.cashBalance || 0,
      change: formatChange(stats?.todayCashChange || 0),
      icon: <Banknote className="w-6 h-6" />,
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      label: 'Bank Balance',
      value: stats?.bankBalance || 0,
      change: formatChange(stats?.todayBankChange || 0),
      icon: <Building className="w-6 h-6" />,
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
    {
      label: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      change: formatChange(stats?.pendingPayments || 0, stats?.pendingPaymentsCount || 0),
      icon: <Clock className="w-6 h-6" />,
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    },
    {
      label: 'Due Receipts',
      value: stats?.dueReceipts || 0  ,
      change: formatChange(stats?.dueReceipts || 0, stats?.dueReceiptsCount || 0),
      icon: <Receipt className="w-6 h-6" />,
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {renderStatsCards()}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/Accounts/transactions/cashPayments">
              <Card className="bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Banknote className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Record Payment</h4>
                      <p className="text-sm text-gray-600">Cash/Bank transactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/Accounts/transactions/bank">
              <Card className="bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Record Receipts</h4>
                      <p className="text-sm text-gray-600">Cash/Bank transactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/financialReports/accountBalances">
              <Card className="bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Account Balances</h4>
                      <p className="text-sm text-gray-600">Supplier/Buyers balances</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/Accounts/accountLedger">
              <Card className="bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Ledger</h4>
                      <p className="text-sm text-gray-600">View account statements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loss Analysis Pie Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Loss Breakdown</h3>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <CenteredSpinner size="lg" />
              </div>
            ) : (
              <Pie
                data={{
                  labels: ['Chillar Loss', 'Purchase Loss', 'TS Loss', 'Storage Loss'],
                  datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { enabled: true }
                  }
                }}
              />
            )}
          </div>

          {/* Financial Trend Line Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Financial Trends</h3>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <CenteredSpinner size="lg" />
              </div>
            ) : (
              <Line
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                  datasets: [
                    {
                      label: 'Revenue',
                      data: [45, 52, 60, 55, 70],
                      borderColor: '#10B981',
                      tension: 0.3,
                      fill: false
                    },
                    {
                      label: 'Expenses',
                      data: [30, 40, 35, 45, 50],
                      borderColor: '#EF4444',
                      tension: 0.3,
                      fill: false
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}