// app/chillareceive/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Milk, Scale, User, CheckCircle } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import { DodhiFormModal } from '@/components/modals/ChillarReceiveModal';
import ProtectedRoute from '@/components/ProtectedRoutes';

type Dodhi = {
  id: string;
  name: string;
  added: boolean;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
};

export default function ChillarReceivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('morning');
  const [showModal, setShowModal] = useState(false);
  const [currentDodhi, setCurrentDodhi] = useState<Dodhi | null>(null);

  // Sample dodhis data - replace with your API call
  const [dodhis, setDodhis] = useState<Dodhi[]>([
    { id: 'D001', name: 'Ram Singh', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
    { id: 'D002', name: 'Shyam Kumar', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
    { id: 'D003', name: 'Mohan Lal', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
  ]);

  // Calculate totals
  const calculateTotals = () => {
    const addedDodhis = dodhis.filter(d => d.added);
    return {
      grossTotal: addedDodhis.reduce((sum, d) => sum + d.grossLiters, 0),
      netTotal: addedDodhis.reduce((sum, d) => sum + d.netLiters, 0),
      count: addedDodhis.length
    };
  };

  const { grossTotal, netTotal, count } = calculateTotals();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = (formData: Omit<Dodhi, 'id' | 'name' | 'added'>) => {
    if (!currentDodhi) return;

    const updatedDodhis = dodhis.map(dodhi =>
      dodhi.id === currentDodhi.id
        ? {
          ...dodhi,
          added: true,
          ...formData
        }
        : dodhi
    );

    setDodhis(updatedDodhis);
    setShowModal(false);
    setCurrentDodhi(null);
  };

  const handleDodhiClick = (dodhi: Dodhi) => {
    setCurrentDodhi(dodhi);
    setShowModal(true);
  };

  if (isLoading) return <MilkLoader />;

  return (
    <ProtectedRoute allowedRoles={['chillarincharge', 'admin']}>
      <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
        <div className="max-w-6xl mx-auto p-.5 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="bg-white shadow-sm rounded-lg p-3 mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
              <Scale className="w-6 h-6" />
              Chillar Receive
            </h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              title="Total Received"
              value={`${grossTotal.toFixed(2)} Ltrs`}
              icon={<Milk className="w-6 h-6" />}
              color="blue"
            />
            <SummaryCard
              title="Total Net Ltrs"
              value={`${netTotal.toFixed(2)} Ltrs`}
              icon={<Scale className="w-6 h-6" />}
              color="green"
            />
            <SummaryCard
              title="Dodhis Count"
              value={count.toString()}
              icon={<User className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* Dodhis Lists */}
          {/* Dodhis Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RemainingList
              title="Remaining Dodhis"
              items={dodhis.filter(d => !d.added)}
              getKey={(item) => item.id}
              getName={(item) => item.name}
              getId={(item) => item.id}
              getStatusLabel={() => (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              )}
              onItemClick={(dodhi) => {
                setCurrentDodhi(dodhi);
                setShowModal(true);
              }}
              icon={<User className="w-5 h-5" />}
            />

            <AddedList
              title="Added Dodhis"
              items={dodhis.filter(d => d.added)}
              getKey={(item) => item.id}
              getName={(item) => item.name}
              getId={(item) => item.id}
              getDetails={(item) => (
                <div className="text-right">
                  <p className="text-sm font-medium">{item.grossLiters} Ltrs</p>
                  <p className="text-xs text-gray-600">Net: {item.netLiters} Ltrs</p>
                </div>
              )}
              onItemClick={(dodhi) => {
                setCurrentDodhi(dodhi);
                setShowModal(true);
              }}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Dodhi Form Modal */}
          <DodhiFormModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setCurrentDodhi(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={currentDodhi ? {
              grossLiters: currentDodhi.grossLiters,
              lr: currentDodhi.lr,
              fat: currentDodhi.fat,
              netLiters: currentDodhi.netLiters
            } : undefined}
            dodhiName={currentDodhi?.name || ''}
            dodhiId={currentDodhi?.id || ''}
            date={date}
            time={time}
            isFromAddedList={currentDodhi?.added || false}
          />
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}