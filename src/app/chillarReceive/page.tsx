//app/chillarReceive/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Milk, Scale, User, CheckCircle } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import { DodhiFormModal } from '@/components/modals/ChillarReceiveModal';
import ProtectedRoute from '@/components/ProtectedRoutes';

import {
  getMyChillar,
  getChillarReceiveMetadata,
  createChillarReceive,
  updateChillarReceive,
} from '@/lib/api/chillarReceive';

type Dodhi = {
  dodhiId: number;
  fullName: string;
  added: boolean;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
  receiveId?: number;
};

export default function ChillarReceivePage() {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<'morning' | 'evening'>('morning');
  const [dodhis, setDodhis] = useState<Dodhi[]>([]);
  const [totals, setTotals] = useState({ gross: 0, net: 0, count: 0 });
  const [modalDodhi, setModalDodhi] = useState<Dodhi | null>(null);

  const [chillarId, setChillarId] = useState<number | null>(null);
  const [chillarInchargeId, setChillarInchargeId] = useState<number | null>(null);

  // Form state for live calculation
  const [formValues, setFormValues] = useState({
    grossLiters: 0,
    lr: 0,
    fat: 0,
    netLiters: 0,
  });

  const calculateNetLiters = (lr: number, fat: number, volume: number, tsStandard: number = 13): number => {
    const fatOperations = 0.22 * fat + 0.72;
    const lrOperations = lr / 4;
    const snf = fatOperations + lrOperations;
    const volumeOperations = (snf + fat) * volume;
    const ts = volumeOperations / tsStandard;
    return parseFloat(ts.toFixed(2));
  };

  // Handle input changes and recalculate net liters
  const handleInputChange = (field: string, value: number) => {
    const newValues = {
      ...formValues,
      [field]: value || 0, // Default to 0 if value is NaN
    };

    // Recalculate net liters when any input changes
    newValues.netLiters = calculateNetLiters(
      field === 'lr' ? value : newValues.lr,
      field === 'fat' ? value : newValues.fat,
      field === 'grossLiters' ? value : newValues.grossLiters
    );

    setFormValues(newValues);
  };

  // Fetch metadata on date/time change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { chillarId, chillarInchargeId } = await getMyChillar();
        setChillarId(chillarId);
        setChillarInchargeId(chillarInchargeId);

        const meta = await getChillarReceiveMetadata(date, time);

        const remaining: Dodhi[] = meta.remainingDodhis.map(d => ({
          ...d,
          added: false,
          grossLiters: 0,
          lr: 0,
          fat: 0,
          netLiters: 0,
        }));

        const added: Dodhi[] = meta.addedDodhis.map(a => ({
          dodhiId: a.dodhiID,
          fullName: a.dodhiName,
          added: true,
          grossLiters: a.grossLiters,
          lr: a.lr ?? 0,
          fat: a.fat ?? 0,
          netLiters: calculateNetLiters(a.lr ?? 0, a.fat ?? 0, a.grossLiters),
          receiveId: a.receiveId,
        }));

        setDodhis([...remaining, ...added]);

        const gross = added.reduce((sum, d) => sum + d.grossLiters, 0);
        const net = added.reduce((sum, d) => sum + d.netLiters, 0);
        setTotals({ gross, net, count: added.length });
      } finally {
        setLoading(false);
      }
    })();
  }, [date, time]);

  // Update form values when modal opens
  useEffect(() => {
    if (modalDodhi) {
      setFormValues({
        grossLiters: modalDodhi.grossLiters,
        lr: modalDodhi.lr,
        fat: modalDodhi.fat,
        netLiters: modalDodhi.netLiters,
      });
    } else {
      setFormValues({
        grossLiters: 0,
        lr: 0,
        fat: 0,
        netLiters: 0,
      });
    }
  }, [modalDodhi]);

  const openForm = (dodhi: Dodhi) => setModalDodhi(dodhi);
  const closeForm = () => setModalDodhi(null);

  const onSubmit = async (formData: {
    grossLiters: number;
    lr: number;
    fat: number;
  }) => {
    if (!modalDodhi || !chillarId || !chillarInchargeId) return;

    const netLiters = calculateNetLiters(
      formData.lr,
      formData.fat,
      formData.grossLiters
    );

    const payload = {
      date,
      timeOfDay: time,
      chillarId,
      chillarInchargeId,
      dodhiId: modalDodhi.dodhiId,
      ...formData,
      netLiters,
    };

    if (modalDodhi.added && modalDodhi.receiveId) {
      await updateChillarReceive(modalDodhi.receiveId, payload);
    } else {
      const created = await createChillarReceive(payload);
      modalDodhi.receiveId = created.receiveId;
    }

    const updated = dodhis.map(d =>
      d.dodhiId === modalDodhi.dodhiId
        ? { ...d, added: true, ...formData, netLiters }
        : d
    );
    setDodhis(updated);

    const added = updated.filter(d => d.added);
    const gross = added.reduce((sum, d) => sum + d.grossLiters, 0);
    const net = added.reduce((sum, d) => sum + d.netLiters, 0);
    setTotals({ gross, net, count: added.length });

    closeForm();
  };

  if (loading) return <MilkLoader />;

  return (
    <ProtectedRoute allowedRoles={['chillarincharge', 'admin']}>
      <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
        <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
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
                  onChange={e => setDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={time}
                  onChange={e => setTime(e.target.value as 'morning' | 'evening')}
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
              value={`${totals.gross.toFixed(2)} Ltrs`}
              icon={<Milk className="w-6 h-6" />}
              color="blue"
            />
            <SummaryCard
              title="Total Net Ltrs"
              value={`${totals.net.toFixed(2)} Ltrs`}
              icon={<Scale className="w-6 h-6" />}
              color="green"
            />
            <SummaryCard
              title="Dodhis Count"
              value={totals.count.toString()}
              icon={<User className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* Dodhis Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RemainingList
              title="Remaining Dodhis"
              items={dodhis.filter(d => !d.added)}
              getKey={d => String(d.dodhiId)}
              getName={d => d.fullName}
              getId={d => String(d.dodhiId)}
              getStatusLabel={() => (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              )}
              onItemClick={openForm}
              icon={<User className="w-5 h-5" />}
            />

            <AddedList
              title="Added Dodhis"
              items={dodhis.filter(d => d.added)}
              getKey={d => String(d.dodhiId)}
              getName={d => d.fullName}
              getId={d => String(d.dodhiId)}
              getDetails={d => (
                <div className="text-right">
                  <p className="text-sm font-medium">{d.grossLiters} Ltrs</p>
                  <p className="text-xs text-gray-600">Net: {d.netLiters} Ltrs</p>
                </div>
              )}
              onItemClick={openForm}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Modal */}
          <DodhiFormModal
            isOpen={!!modalDodhi}
            onClose={closeForm}
            onSubmit={onSubmit}
            initialData={
              modalDodhi
                ? {
                    grossLiters: modalDodhi.grossLiters,
                    lr: modalDodhi.lr,
                    fat: modalDodhi.fat,
                    netLiters: modalDodhi.netLiters,
                  }
                : undefined
            }
            dodhiName={modalDodhi?.fullName || ''}
            date={date}
            time={time}
            dodhiId={String(modalDodhi?.dodhiId || '')}
            isFromAddedList={modalDodhi?.added || false}
            formValues={formValues}
            onInputChange={handleInputChange}
          />
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}