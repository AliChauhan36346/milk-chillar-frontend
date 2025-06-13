'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit, DollarSign, Hash, MapPin, Calendar } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';

type Buyer = {
  buyer_id: number;
  full_name: string;
  khata_number: string;
  rate: number;
  credit_limit: number;
  address: string;
  is_active: boolean;
  created_at: string;
  account: {
    account_id: number;
    name: string;
  };
};

export default function BuyerDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyerId = searchParams.get('id');
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (buyerId) {
      fetchBuyerDetails();
    }
  }, [buyerId]);

  const fetchBuyerDetails = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/buyers/${buyerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch buyer details');
      }
      const data = await response.json();
      setBuyer(data);
    } catch (error) {
      console.error('Error fetching buyer details:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
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

  if (!buyer) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Buyer Not Found</h1>
            <BackButton />
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">Buyer Details</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{buyer.full_name}</h2>
                <p className="text-gray-500">Created on {new Date(buyer.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => router.push(`/Buyers/createBuyer?id=${buyer.buyer_id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit Buyer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Khata Number</h3>
                    <p className="text-gray-900">{buyer.khata_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rate per Liter</h3>
                    <p className="text-gray-900">₹{buyer.rate.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Credit Limit</h3>
                    <p className="text-gray-900">₹{buyer.credit_limit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-gray-900">{buyer.address || 'No address provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account</h3>
                    <p className="text-gray-900">{buyer.account.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      buyer.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {buyer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
