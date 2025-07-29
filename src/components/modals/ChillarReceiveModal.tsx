// components/modals/ChillarReceiveModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Plus, X, User, Calendar, Clock, Droplet, Weight, Percent, Scale } from 'lucide-react';

type DodhiFormData = {
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
};

type DodhiFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DodhiFormData) => void;
  initialData?: DodhiFormData;
  dodhiName: string;
  dodhiId: string;
  date: string;
  time: string;
  isFromAddedList: boolean;
  formValues: DodhiFormData;
  onInputChange: (field: string, value: number) => void;
};

export function DodhiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  dodhiName,
  dodhiId,
  date,
  time,
  isFromAddedList,
  formValues,
  onInputChange
}: DodhiFormModalProps) {
  const isUpdateMode = isFromAddedList;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-4 ${isUpdateMode ? 'bg-green-50 border-b' : 'bg-blue-600 text-white'}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isUpdateMode ? 'text-green-700' : 'text-white'}`}>
              {isUpdateMode ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Update Record
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Record
                </>
              )}
            </h3>
            <button onClick={onClose} className={isUpdateMode ? "text-gray-500 hover:text-gray-700" : "text-white hover:text-blue-200"}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dodhi Info */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{dodhiName}</h4>
              <p className="text-sm text-blue-600 font-medium">ID: {dodhiId}</p>
            </div>
          </div>

          {/* Date/Time Fields */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  readOnly
                  className="w-full p-1 pl-10 border border-gray-300 rounded-lg bg-gray-100"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <div className="relative">
                <select
                  value={time}
                  disabled
                  className="w-full p-1 pl-10 border border-gray-300 rounded-lg appearance-none bg-gray-100"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Gross Liters */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplet className="w-4 h-4 text-blue-500" />
              Gross Liters (L)
            </label>
            <input
              type="number"
              value={formValues.grossLiters}
              onChange={(e) => onInputChange('grossLiters', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              step="0.01"
              placeholder="Enter quantity"
            />
          </div>

          {/* LR and Fat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Weight className="w-4 h-4 text-green-500" />
                LR (%)
              </label>
              <input
                type="number"
                value={formValues.lr}
                onChange={(e) => onInputChange('lr', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                step="0.01"
                placeholder="Enter LR"
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Percent className="w-4 h-4 text-purple-500" />
                Fat (%)
              </label>
              <input
                type="number"
                value={formValues.fat}
                onChange={(e) => onInputChange('fat', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                step="0.01"
                placeholder="Enter fat"
              />
            </div>
          </div>

          {/* Net Liters */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Scale className="w-4 h-4 text-orange-500" />
              Net Liters (Calculated)
            </label>
            <input
              type="number"
              value={formValues.netLiters.toFixed(2)}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-gray-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-0 transition-colors
                ${isUpdateMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isUpdateMode ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}