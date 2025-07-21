'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getSupplierById, Supplier, deleteSupplier } from '@/lib/api/suppliers';
import { useToast } from '@/hooks/useToast';

export default function SupplierDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('id');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (supplierId) {
      fetchSupplierDetails();
    }
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    try {
      const data = await getSupplierById(Number(supplierId));
      setSupplier(data);
    } catch (error) {
      toast({ title: 'Error fetching supplier details', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
      console.error('Error fetching supplier details:', error);
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
              <h1 className="text-2xl font-bold text-gray-800">{supplier.accountName}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplierId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit Supplier
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
                    try {
                      await deleteSupplier(supplier.supplierId);
                      toast({ title: 'Supplier deleted successfully!', variant: 'success' });
                      router.push('/Suppliers/supplierList');
                    } catch (error) {
                      toast({ title: 'Error deleting supplier', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
                    }
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Khata Number</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.khataNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rate per Liter</label>
                  <p className="mt-1 text-sm text-gray-900"> ₨{supplier.rate?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Credit Limit</label>
                  <p className="mt-1 text-sm text-gray-900"> ₨{supplier.creditLimit?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Dodhi Name</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.dodhiName}</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Name</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.accountName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Code</label>
                  <p className="mt-1 text-sm text-gray-900">{supplier.accountCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      supplier.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

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
