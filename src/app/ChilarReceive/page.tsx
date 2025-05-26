// app/chillar/receive/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Milk, Scale, User, CheckCircle, Plus } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';

export default function ChillarReceivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('morning');
  const grossLitersRef = useRef<HTMLInputElement>(null);
  
  // Sample dodhis data - replace with your API call
  const [dodhis, setDodhis] = useState([
    { id: 'D001', name: 'Ram Singh', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
    { id: 'D002', name: 'Shyam Kumar', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
    { id: 'D003', name: 'Mohan Lal', added: false, grossLiters: 0, lr: 0, fat: 0, netLiters: 0 },
  ]);

  const [formData, setFormData] = useState({
    dodhiId: '',
    dodhiName: '',
    grossLiters: '',
    lr: '',
    fat: '',
    netLiters: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedDodhis = dodhis.map(dodhi => 
      dodhi.id === formData.dodhiId
        ? { 
            ...dodhi, 
            added: true,
            grossLiters: parseFloat(formData.grossLiters),
            lr: parseFloat(formData.lr),
            fat: parseFloat(formData.fat),
            netLiters: parseFloat(formData.netLiters)
          }
        : dodhi
    );

    setDodhis(updatedDodhis);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      dodhiId: '',
      dodhiName: '',
      grossLiters: '',
      lr: '',
      fat: '',
      netLiters: ''
    });
  };

  const handleDodhiClick = (dodhi: any) => {
    setFormData({
      dodhiId: dodhi.id,
      dodhiName: dodhi.name,
      grossLiters: dodhi.added ? dodhi.grossLiters.toString() : '',
      lr: dodhi.added ? dodhi.lr.toString() : '',
      fat: dodhi.added ? dodhi.fat.toString() : '',
      netLiters: dodhi.added ? dodhi.netLiters.toString() : ''
    });
    
    setTimeout(() => grossLitersRef.current?.focus(), 100);
  };

  const calculateNetLiters = (gross: string, lr: string, fat: string) => {
    const grossNum = parseFloat(gross) || 0;
    const lrNum = parseFloat(lr) || 0;
    const fatNum = parseFloat(fat) || 0;
    
    // Replace with your actual net liters calculation formula
    const net = grossNum - (lrNum * fatNum * 0.01); // Example formula
    return net.toFixed(2);
  };

  if (isLoading) return <MilkLoader />;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm rounded-lg p-4 mb-6">
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
      </header>

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

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          {formData.dodhiId ? 'Update Record' : 'Add New Record'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi ID</label>
            <input
              type="text"
              value={formData.dodhiId}
              onChange={(e) => setFormData({...formData, dodhiId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              readOnly={!!formData.dodhiId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi Name</label>
            <input
              type="text"
              value={formData.dodhiName}
              onChange={(e) => setFormData({...formData, dodhiName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              readOnly={!!formData.dodhiId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Liters</label>
            <input
              type="number"
              ref={grossLitersRef}
              value={formData.grossLiters}
              onChange={(e) => setFormData({
                ...formData, 
                grossLiters: e.target.value,
                netLiters: calculateNetLiters(e.target.value, formData.lr, formData.fat)
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LR</label>
            <input
              type="number"
              value={formData.lr}
              onChange={(e) => setFormData({
                ...formData, 
                lr: e.target.value,
                netLiters: calculateNetLiters(formData.grossLiters, e.target.value, formData.fat)
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fat</label>
            <input
              type="number"
              value={formData.fat}
              onChange={(e) => setFormData({
                ...formData, 
                fat: e.target.value,
                netLiters: calculateNetLiters(formData.grossLiters, formData.lr, e.target.value)
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Liters</label>
            <input
              type="number"
              value={formData.netLiters}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium
                       flex items-center justify-center gap-2"
            >
              {formData.dodhiId ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {formData.dodhiId ? 'Update Record' : 'Add Record'}
            </button>
            
            {formData.dodhiId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dodhis Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Remaining Dodhis */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
            <User className="w-5 h-5" />
            Remaining Dodhis ({dodhis.filter(d => !d.added).length})
          </h3>
          <div className="space-y-2">
            {dodhis.filter(d => !d.added).map((dodhi) => (
              <div 
                key={dodhi.id}
                className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors"
                onClick={() => handleDodhiClick(dodhi)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{dodhi.name}</p>
                    <p className="text-sm text-gray-600">ID: {dodhi.id}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Added Dodhis */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Added Dodhis ({dodhis.filter(d => d.added).length})
          </h3>
          <div className="space-y-2">
            {dodhis.filter(d => d.added).map((dodhi) => (
              <div 
                key={dodhi.id}
                className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => handleDodhiClick(dodhi)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{dodhi.name}</p>
                    <p className="text-sm text-gray-600">ID: {dodhi.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{dodhi.grossLiters} Ltrs</p>
                    <p className="text-xs text-gray-600">Net: {dodhi.netLiters} Ltrs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}