'use client';
import { useState } from 'react';
import {
  X,
  Settings,
  Calendar,
  Users,
  Database,
  Calculator,
  Trash2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateRateModal } from './UpdateRateModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<'updateRate' | null>(null);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white w-[90vw] max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Settings & System Management
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Configure rates, fiscal years, data resets, and system users
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Grid of Working Tools */}
          <div className="p-6 sm:p-8 bg-gray-50/50 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* 1. Rate Update Tool */}
              <button
                onClick={() => setActiveModal('updateRate')}
                className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between w-full">
                  Update Period Rates
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Update Supplier/Buyer rates for a specific time period. Automatically recalculates ledger balances.
                </p>
              </button>

              {/* 2. Bulk Data Cleanup & Reset */}
              <button
                onClick={() => navigateTo('/System?tab=cleanup')}
                className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-red-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between w-full">
                  Data Cleanup & Reset
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Purge operational transactions and demo data safely while keeping Chart of Accounts and master parties intact.
                </p>
              </button>

              {/* 3. Financial Years Management */}
              <button
                onClick={() => navigateTo('/System?tab=financial-years')}
                className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between w-full">
                  Financial Years
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Manage active fiscal years, view audit dates, create new accounting periods, and manage annual closings.
                </p>
              </button>

              {/* 4. User & Role Management */}
              <button
                onClick={() => navigateTo('/Users')}
                className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between w-full">
                  User Management
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Manage system users, login credentials, assigned roles, and granular staff access privileges.
                </p>
              </button>

              {/* 5. System Architecture & Info */}
              <button
                onClick={() => navigateTo('/System?tab=info')}
                className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                  <Database className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between w-full">
                  System & Database Info
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Inspect cloud database engine status, tenant isolation, API framework versions, and security metadata.
                </p>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Feature Modals */}
      <UpdateRateModal
        isOpen={activeModal === 'updateRate'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
