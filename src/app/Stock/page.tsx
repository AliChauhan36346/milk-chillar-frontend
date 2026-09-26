'use client';
import { useState, useEffect, useRef } from 'react';
import { Milk, Warehouse, Plus, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import MilkLoader from '@/components/ui/Loader';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function StockPage() {
  const [isLoading, setIsLoading] = useState(true);
  const litersRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Sample data - replace with API calls
  const [stockEntries, setStockEntries] = useState([
    { id: 'S001', date: '2023-10-15', liters: 150, description: 'Morning collection' },
    { id: 'S002', date: '2023-10-15', liters: 120, description: 'Evening collection' },
    { id: 'S003', date: '2023-10-16', liters: 145, description: 'Morning collection' },
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    liters: '',
    description: '',
    isEditing: false,
    editId: ''
  });

  // Calculate total stock
  const totalStock = stockEntries.reduce((sum, entry) => sum + entry.liters, 0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isEditing) {
      // Update existing entry
      const updatedEntries = stockEntries.map(entry =>
        entry.id === formData.editId
          ? {
            ...entry,
            date: formData.date,
            liters: parseFloat(formData.liters),
            description: formData.description
          }
          : entry
      );
      setStockEntries(updatedEntries);
    } else {
      // Add new entry
      const newEntry = {
        id: `S${(stockEntries.length + 1).toString().padStart(3, '0')}`,
        date: formData.date,
        liters: parseFloat(formData.liters),
        description: formData.description
      };
      setStockEntries([...stockEntries, newEntry]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      liters: '',
      description: '',
      isEditing: false,
      editId: ''
    });
  };

  const handleEditClick = (entry: any) => {
    setFormData({
      date: entry.date,
      liters: entry.liters.toString(),
      description: entry.description,
      isEditing: true,
      editId: entry.id
    });
    setTimeout(() => litersRef.current?.focus(), 100);
  };

  const handleDeleteClick = (id: string) => {
    setStockEntries(stockEntries.filter(entry => entry.id !== id));
  };

  if (isLoading) return <MilkLoader />;

  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      <DynamicLayout>
        <div className="max-w-7xl mx-auto space-y-4">
          <PageHeader
            title="Stock Management"
            subtitle="Monitor and adjust milk inventory and batch records"
            icon={<Warehouse className="w-5 h-5 text-blue-600" />}
          />

          <StatStrip
            items={[
              {
                label: 'Total Stock',
                value: `${totalStock.toFixed(2)} L`,
                color: 'primary',
                icon: <Warehouse className="w-4 h-4 text-blue-600" />,
              },
              {
                label: "Today's Entries",
                value: stockEntries.filter(e => e.date === formData.date).length.toString(),
                color: 'success',
                icon: <Milk className="w-4 h-4 text-emerald-600" />,
              },
              {
                label: 'Total Entries',
                value: stockEntries.length.toString(),
                color: 'info',
                icon: <CheckCircle className="w-4 h-4 text-cyan-600" />,
              },
            ]}
          />

          {/* Form Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Milk className="w-4 h-4 text-blue-600" />
              {formData.isEditing ? 'Update Stock Entry' : 'Add New Stock Entry'}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Liters</label>
                <input
                  type="number"
                  ref={litersRef}
                  value={formData.liters}
                  onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Morning collection"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold
                           flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {formData.isEditing ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {formData.isEditing ? 'Update Entry' : 'Add Entry'}
                </button>

                {formData.isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Stock Entries Desktop Table */}
          <div className="hidden md:block">
            <TableContainer title="Stock Entries">
              <Table dense>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Date</Table.Head>
                    <Table.Head className="text-right">Liters</Table.Head>
                    <Table.Head>Description</Table.Head>
                    <Table.Head className="text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {stockEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-xs text-slate-400">
                        No stock entries recorded
                      </td>
                    </tr>
                  ) : (
                    stockEntries.map((entry) => (
                      <Table.Row key={entry.id}>
                        <Table.Cell className="font-medium text-xs text-slate-900">{entry.date}</Table.Cell>
                        <Table.Cell className="text-right font-semibold text-xs text-blue-600">{entry.liters} L</Table.Cell>
                        <Table.Cell className="text-xs text-slate-600">{entry.description || '-'}</Table.Cell>
                        <Table.Cell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(entry)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(entry.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Stock Entries */}
          <div className="md:hidden space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Entries</h3>
              <span className="text-[11px] text-slate-400">{stockEntries.length} entries</span>
            </div>
            {stockEntries.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No stock entries recorded
              </div>
            ) : (
              stockEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-xs text-slate-800">{entry.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-slate-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Quantity</span>
                      <span className="font-bold text-blue-600 text-sm">{entry.liters} L</span>
                    </div>
                    {entry.description && (
                      <div className="text-right max-w-[60%]">
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">Description</span>
                        <span className="text-slate-600 text-xs truncate block">{entry.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}   