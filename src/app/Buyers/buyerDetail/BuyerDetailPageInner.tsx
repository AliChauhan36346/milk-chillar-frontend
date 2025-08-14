'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit, DollarSign, Hash, MapPin, Calendar } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getBuyerById, Buyer, deleteBuyer } from '@/lib/api/buyers';
import { useToast } from '@/hooks/useToast';

export default function BuyerDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyerId = searchParams.get('id');
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (buyerId) {
      fetchBuyerDetails();
    }
    // eslint-disable-next-line
  }, [buyerId]);

  const fetchBuyerDetails = async () => {
    try {
      const data = await getBuyerById(Number(buyerId));
      setBuyer(data);
    } catch (error) {
      toast({ title: 'Error fetching buyer details', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
      console.error('Error fetching buyer details:', error);
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
                <h2 className="text-xl font-semibold text-gray-800">{buyer.accountName}</h2>
                {/* If you have created_at, show it. Otherwise, remove this line. */}
                {/* <p className="text-gray-500">Created on {new Date(buyer.created_at).toLocaleDateString()}</p> */}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/Buyers/createBuyer?id=${buyer.buyerId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  Edit Buyer
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this buyer? This action cannot be undone.')) {
                      try {
                        await deleteBuyer(buyer.buyerId);
                        toast({ title: 'Buyer deleted successfully!', variant: 'success' });
                        router.push('/Buyers/buyerList');
                      } catch (error) {
                        toast({ title: 'Error deleting buyer', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Khata Number</h3>
                    <p className="text-gray-900">{buyer.khataNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rate per Liter</h3>
                    <p className="text-gray-900">₨{buyer.rate?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Credit Limit</h3>
                    <p className="text-gray-900">₨{buyer.creditLimit?.toFixed(2)}</p>
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
                    <p className="text-gray-900">{buyer.accountName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      buyer.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {buyer.isActive ? 'Active' : 'Inactive'}
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
