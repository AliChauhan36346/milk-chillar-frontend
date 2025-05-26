'use client';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, UserPlus, Milk, Save, Sun, Moon } from 'lucide-react';

export default function PurchaseForm() {
  const morningQtyRef = useRef<HTMLInputElement>(null);
  const eveningQtyRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];
  
  const [suppliers, setSuppliers] = useState([
    { 
      id: '001', 
      name: 'Rajesh Dairy', 
      morning: { added: false, quantity: 0 }, 
      evening: { added: false, quantity: 0 } 
    },
    { 
      id: '002', 
      name: 'Ganesh Milk Farm', 
      morning: { added: false, quantity: 0 }, 
      evening: { added: false, quantity: 0 } 
    },
    { 
      id: '003', 
      name: 'Shivam Suppliers', 
      morning: { added: false, quantity: 0 }, 
      evening: { added: false, quantity: 0 } 
    },
  ]);

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: today,
    morning: { checked: true, quantity: '' },
    evening: { checked: false, quantity: '' },
    isEditing: false
  });

  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === formData.supplierId) {
        return {
          ...supplier,
          morning: formData.morning.checked ? { 
            added: true, 
            quantity: parseInt(formData.morning.quantity) || 0 
          } : supplier.morning,
          evening: formData.evening.checked ? { 
            added: true, 
            quantity: parseInt(formData.evening.quantity) || 0 
          } : supplier.evening
        };
      }
      return supplier;
    });

    if (!suppliers.some(s => s.id === formData.supplierId)) {
      updatedSuppliers.push({
        id: formData.supplierId,
        name: formData.supplierName,
        morning: formData.morning.checked ? { 
          added: true, 
          quantity: parseInt(formData.morning.quantity) || 0 
        } : { added: false, quantity: 0 },
        evening: formData.evening.checked ? { 
          added: true, 
          quantity: parseInt(formData.evening.quantity) || 0 
        } : { added: false, quantity: 0 }
      });
    }

    setSuppliers(updatedSuppliers);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      supplierName: '',
      date: today,
      morning: { checked: true, quantity: '' },
      evening: { checked: false, quantity: '' },
      isEditing: false
    });
  };

  const handleSupplierClick = (supplier: any) => {
    setFormData({
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: today,
      morning: { 
        checked: !supplier.morning.added, 
        quantity: supplier.morning.added ? supplier.morning.quantity.toString() : '' 
      },
      evening: { 
        checked: !supplier.evening.added, 
        quantity: supplier.evening.added ? supplier.evening.quantity.toString() : '' 
      },
      isEditing: supplier.morning.added || supplier.evening.added
    });

    // Focus on first available quantity field
    setTimeout(() => {
      if (!supplier.morning.added && formData.morning.checked) {
        morningQtyRef.current?.focus();
      } else if (!supplier.evening.added && formData.evening.checked) {
        eveningQtyRef.current?.focus();
      }
    }, 100);
  };

  const isSupplierComplete = (supplier: any) => {
    if (timeFilter === 'morning') return supplier.morning.added;
    if (timeFilter === 'evening') return supplier.evening.added;
    return supplier.morning.added && supplier.evening.added;
  };

  const calculateTotals = () => {
    let morningTotal = 0;
    let eveningTotal = 0;

    suppliers.forEach(supplier => {
      if (supplier.morning.added) morningTotal += supplier.morning.quantity;
      if (supplier.evening.added) eveningTotal += supplier.evening.quantity;
    });

    return { morningTotal, eveningTotal, combinedTotal: morningTotal + eveningTotal };
  };

  const { morningTotal, eveningTotal, combinedTotal } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
          <Milk className="w-6 h-6" />
          {formData.isEditing ? 'Update Milk Purchase' : 'New Milk Purchase'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier ID</label>
              <input
                type="text"
                value={formData.supplierId}
                onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                readOnly={formData.isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                readOnly={formData.isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Morning Milk */}
              <div className={`p-3 rounded-lg border ${formData.morning.checked ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.morning.checked}
                    onChange={(e) => setFormData({
                      ...formData,
                      morning: { ...formData.morning, checked: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1 font-medium">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    Morning Milk
                  </span>
                </label>
                {formData.morning.checked && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quantity (Ltrs)</label>
                    <input
                      type="number"
                      ref={morningQtyRef}
                      value={formData.morning.quantity}
                      onChange={(e) => setFormData({
                        ...formData,
                        morning: { ...formData.morning, quantity: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={formData.morning.checked}
                      disabled={!formData.morning.checked}
                    />
                  </div>
                )}
              </div>

              {/* Evening Milk */}
              <div className={`p-3 rounded-lg border ${formData.evening.checked ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.evening.checked}
                    onChange={(e) => setFormData({
                      ...formData,
                      evening: { ...formData.evening, checked: e.target.checked }
                    })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="flex items-center gap-1 font-medium">
                    <Moon className="w-4 h-4 text-purple-500" />
                    Evening Milk
                  </span>
                </label>
                {formData.evening.checked && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quantity (Ltrs)</label>
                    <input
                      type="number"
                      ref={eveningQtyRef}
                      value={formData.evening.quantity}
                      onChange={(e) => setFormData({
                        ...formData,
                        evening: { ...formData.evening, quantity: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={formData.evening.checked}
                      disabled={!formData.evening.checked}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
                       hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {formData.isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  Update Record
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Add Purchase Record
                </>
              )}
            </button>
            
            {formData.isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium
                         hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-3 rounded-lg ${timeFilter === 'morning' || timeFilter === 'both' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">Morning Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{morningTotal} Ltrs</p>
        </div>

        <div className={`p-3 rounded-lg ${timeFilter === 'evening' || timeFilter === 'both' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Moon className="w-4 h-4 text-purple-500" />
            <span className="font-medium">Evening Total</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{eveningTotal} Ltrs</p>
        </div>

        <div className={`p-3 rounded-lg ${timeFilter === 'both' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">Combined Total</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{combinedTotal} Ltrs</p>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 justify-center">
        <button
          onClick={() => setTimeFilter('morning')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
        >
          <Sun className="w-4 h-4" />
          Morning Only
        </button>
        <button
          onClick={() => setTimeFilter('evening')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'evening' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
        >
          <Moon className="w-4 h-4" />
          Evening Only
        </button>
        <button
          onClick={() => setTimeFilter('both')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'both' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
        >
          <CheckCircle className="w-4 h-4" />
          Both
        </button>
      </div>

      {/* Suppliers Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Remaining Suppliers - Left Side */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
            <CheckCircle className="w-5 h-5" />
            Remaining Suppliers
          </h3>
          <div className="space-y-2">
            {suppliers
              .filter(supplier => !isSupplierComplete(supplier))
              .map((supplier) => {
                const showMorning = !supplier.morning.added && (timeFilter === 'morning' || timeFilter === 'both');
                const showEvening = !supplier.evening.added && (timeFilter === 'evening' || timeFilter === 'both');
                
                return (
                  <>
                    {showMorning && (
                      <div 
                        key={`${supplier.id}-morning`}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors border-l-4 border-yellow-400"
                        onClick={() => handleSupplierClick(supplier)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">ID: {supplier.id}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Sun className="w-3 h-3" />
                            Morning
                          </span>
                        </div>
                      </div>
                    )}
                    {showEvening && (
                      <div 
                        key={`${supplier.id}-evening`}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors border-l-4 border-purple-400"
                        onClick={() => handleSupplierClick(supplier)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">ID: {supplier.id}</p>
                          </div>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Moon className="w-3 h-3" />
                            Evening
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
          </div>
        </div>

        {/* Added Suppliers - Right Side */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Added Suppliers
          </h3>
          <div className="space-y-2">
            {suppliers
              .filter(supplier => isSupplierComplete(supplier))
              .map((supplier) => {
                const showMorning = supplier.morning.added && (timeFilter === 'morning' || timeFilter === 'both');
                const showEvening = supplier.evening.added && (timeFilter === 'evening' || timeFilter === 'both');
                
                return (
                  <>
                    {showMorning && (
                      <div 
                        key={`${supplier.id}-morning`}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-green-50 transition-colors border-l-4 border-yellow-400"
                        onClick={() => handleSupplierClick(supplier)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">ID: {supplier.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Sun className="w-3 h-3" />
                              Morning
                            </span>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {supplier.morning.quantity} Ltrs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {showEvening && (
                      <div 
                        key={`${supplier.id}-evening`}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-green-50 transition-colors border-l-4 border-purple-400"
                        onClick={() => handleSupplierClick(supplier)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">ID: {supplier.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Moon className="w-3 h-3" />
                              Evening
                            </span>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {supplier.evening.quantity} Ltrs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}