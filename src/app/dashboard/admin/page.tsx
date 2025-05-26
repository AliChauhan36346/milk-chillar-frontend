// Updated page.tsx with new charts and cards
// app/dashboard/admin/page.tsx
'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Line, Pie } from 'react-chartjs-2';
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
  ArcElement,   // ✅ This is what was missing
  Tooltip,
  Legend
);


export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Loss', 
            value: '15,200 L', 
            change: '+2.5%', 
            icon: '📉',
            bg: 'bg-red-50',
            text: 'text-red-600'
          },
          { 
            label: 'Revenue', 
            value: 'PKR 2.1M', 
            change: '+8.2%', 
            icon: '💰',
            bg: 'bg-green-50',
            text: 'text-green-600'
          },
          { 
            label: 'Expenses', 
            value: 'PKR 1.4M', 
            change: '-1.3%', 
            icon: '📤',
            bg: 'bg-orange-50',
            text: 'text-orange-600'
          },
          { 
            label: 'Net Profit', 
            value: 'PKR 700K', 
            change: '+15%', 
            icon: '📊',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
          },
        ].map((item) => (
          <Card key={item.label} className={`${item.bg} shadow-sm`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
                <span className="text-xs text-gray-500">{item.change}</span>
              </div>
              <span className="text-2xl">{item.icon}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Analysis Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Loss Breakdown</h3>
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
        </div>

        {/* Financial Trend Line Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Financial Trends</h3>
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
        </div>
      </div>
    </DashboardLayout>
  );
}