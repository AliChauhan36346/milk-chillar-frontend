'use client';
import { useState, useEffect, useRef } from 'react';
import { Milk, Warehouse, Plus, CheckCircle, Home, ShoppingCart, Truck } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';




export default function StockPage() {

  const isAdmin = false; // Set to true if you need admin features
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
    <div className="max-w-6xl mx-auto p-2 bg-gray-50 min-h-screen">
      {/* Navigation Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 mt-2">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-blue-600">
            <Milk className="w-6 h-6" />
            Stock Management
          </h1>
          <div className="w-10"></div> {/* Spacer for layout balance */}
        </div>
      </div>

      
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Total Stock"
            value={`${totalStock.toFixed(2)} Ltrs`}
            icon={<Warehouse className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            title="Today's Entries"
            value={stockEntries.filter(e => e.date === formData.date).length.toString()}
            icon={<Milk className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            title="Total Entries"
            value={stockEntries.length.toString()}
            icon={<CheckCircle className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Milk className="w-5 h-5" />
            {formData.isEditing ? 'Update Stock Entry' : 'Add New Stock Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Liters</label>
              <input
                type="number"
                ref={litersRef}
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Morning collection, Evening collection, etc."
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium
                         flex items-center justify-center gap-2"
              >
                {formData.isEditing ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {formData.isEditing ? 'Update Entry' : 'Add Entry'}
              </button>

              {formData.isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Stock Entries Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Warehouse className="w-5 h-5" />
              Stock Entries
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liters</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.liters} Ltrs</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
    </div>
  );
}   