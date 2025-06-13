'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';

type Supplier = {
  supplier_id: number;
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
    main_account: {
      main_account_id: number;
      name: string;
    };
    sub_account: {
      sub_account_id: number;
      name: string;
    };
  };
  dodhi?: {
    employee_id: number;
    full_name: string;
    designation: string;
  };
};

export default function SupplierDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('id');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supplierId) {
      fetchSupplierDetails();
    }
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/suppliers/${supplierId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier details');
      }
      const data = await response.json();
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier details:', error);
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

  if (!supplier) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="max-w-3xl mx-auto p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Supplier Not Found</h2>
              <p className="text-gray-600 mb-6">The supplier you're looking for doesn't exist or has been removed.</p>
              <BackButton />
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-800">{supplier.full_name}</h1>
            </div>
            <button
              onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplier_id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Supplier
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Khata Number</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.khata_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rate per Liter</label>
                  <p className="mt-1 text-sm text-gray-900">₨{supplier.rate.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Credit Limit</label>
                  <p className="mt-1 text-sm text-gray-900">₨{supplier.credit_limit.toFixed(2)}</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Name</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.account.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Main Account</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.account.main_account.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sub Account</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.account.sub_account.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      supplier.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Dodhi Information */}
              {supplier.dodhi && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Dodhi Information</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Dodhi Name</label>
                    <p className="mt-1 text-sm text-gray-900">{supplier.dodhi.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Designation</label>
                    <p className="mt-1 text-sm text-gray-900">{supplier.dodhi.designation}</p>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Address</h2>
                <div>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{supplier.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
