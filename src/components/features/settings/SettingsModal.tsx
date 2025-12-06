'use client';
import { useState } from 'react';
import {
  X,
  Settings,
  Banknote,
  Users,
  Database,
  Calculator,
  Briefcase
} from 'lucide-react';
import { UpdateRateModal } from './UpdateRateModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeModal, setActiveModal] = useState<'updateRate' | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white w-[90vw] max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Settings & Maintenance
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage system configurations and rates</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Grid of Tools */}
          <div className="p-8 bg-gray-50/50 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Rate Update Tool */}
              <button
                onClick={() => setActiveModal('updateRate')}
                className="group flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <Calculator className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Update Period Rates</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Update Supplier/Buyer rates for a specific time period. Calculates impact automatically.
                </p>
              </button>

              {/* Placeholders for future tools */}
              <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 group flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-xl">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Employee Roles</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Manage user permissions and roles (Coming Soon).</p>
              </div>

              <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 group flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-xl">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                  <Database className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">System Logs</h3>
                <p className="text-sm text-gray-500 leading-relaxed">View audit trails and system activity (Coming Soon).</p>
              </div>

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
