'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';

type BuyerFormData = {
  full_name: string;
  rate: number;
  khata_number: string;
  credit_limit: number;
  address: string;
  is_active: boolean;
  account_id: number;
};

export default function CreateBuyerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyerId = searchParams.get('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!buyerId);
  const [accounts, setAccounts] = useState<Array<{ account_id: number; name: string }>>([]);
  const [formData, setFormData] = useState<BuyerFormData>({
    full_name: '',
    rate: 0,
    khata_number: '',
    credit_limit: 0,
    address: '',
    is_active: true,
    account_id: 0
  });

  useEffect(() => {
    fetchAccounts();
    if (buyerId) {
      fetchBuyerDetails();
    }
  }, [buyerId]);

  const fetchAccounts = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const fetchBuyerDetails = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/buyers/${buyerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch buyer details');
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching buyer details:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/buyers', {
        method: buyerId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save buyer');
      }

      router.push('/Buyers');
    } catch (error) {
      console.error('Error saving buyer:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">
              {buyerId ? 'Edit Buyer' : 'Create New Buyer'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Khata Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khata Number
                </label>
                <input
                  type="text"
                  value={formData.khata_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, khata_number: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Liter (₹)
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Credit Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Limit (₹)
                </label>
                <input
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_id: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter buyer's address..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Saving...' : buyerId ? 'Update Buyer' : 'Create Buyer'}
              </button>
            </div>
          </form>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
