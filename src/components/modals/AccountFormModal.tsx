import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, CheckCircle, ChevronDown, Building2, FolderOpen, Sparkles, Search } from 'lucide-react';

type CustomSelectOption = { value: string; label: string };
type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, label, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left bg-white border-2 rounded-xl transition-all duration-200 flex items-center justify-between ${
          isOpen 
            ? 'border-blue-500 shadow-lg ring-4 ring-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Search bar for options > 3 */}
          {options.length > 3 && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group ${
                    value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className={`w-4 h-4 ${value === option.value ? 'text-blue-600' : 'text-gray-400'}`} />}
                    {option.label}
                  </span>
                  {value === option.value && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CustomInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
}

const CustomInput = ({ value, onChange, placeholder, label, icon: Icon, required = false }: CustomInputProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all duration-200`}
        />
      </div>
    </div>
  );
};

interface MainAccount {
  main_account_code: string;
  name: string;
}

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; financial_statement_component: string; main_account_code: string }) => void;
  type: 'main' | 'sub';
  mainAccounts?: MainAccount[];
  initialMainAccount?: MainAccount;
}

export default function EnhancedAccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  mainAccounts = [],
  initialMainAccount
}: AccountFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    financial_statement_component: '',
    main_account_code: initialMainAccount?.main_account_code || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || (type === 'main' && !formData.financial_statement_component)) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(formData);
    setFormData({
      name: '',
      financial_statement_component: '',
      main_account_code: ''
    });
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      financial_statement_component: '',
      main_account_code: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const financialComponents = [
  { label: "Current Assets", value: "CurrentAssets" },
  { label: "Non-Current Assets", value: "NonCurrentAssets" },
  { label: "Current Liabilities", value: "CurrentLiabilities" },
  { label: "Non-Current Liabilities", value: "NonCurrentLiabilities" },
  { label: "Capital and Reserves", value: "CapitalAndReserves" },
  { label: "Revenue", value: "Revenue" },
  { label: "Cost of Sales", value: "CostOfSales" },
  { label: "Operating Expenses", value: "OperatingExpenses" },
  { label: "Financial Expenses", value: "FinancialExpenses" }
];

  const mainAccountOptions = mainAccounts.map(acc => ({
    value: acc.main_account_code,
    label: acc.name
  }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-300">
        {/* Enhanced Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                {type === 'main' ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <FolderOpen className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Create {type === 'main' ? 'Main' : 'Sub'} Account
                </h3>
                <p className="text-blue-100 text-sm">
                  {type === 'main' 
                    ? 'Set up a new account category' 
                    : 'Add a subcategory to organize accounts'
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="p-6 space-y-6">
          {type === 'main' && (
            <CustomSelect
              value={formData.financial_statement_component}
              onChange={(value) => setFormData(prev => ({ ...prev, financial_statement_component: value }))}
              options={financialComponents}
              placeholder="Select financial statement component"
              label="Financial Statement Component"
              icon={Sparkles}
            />
          )}

          {type === 'sub' && (
            <CustomSelect
              value={formData.main_account_code}
              onChange={(value) => setFormData(prev => ({ ...prev, main_account_code: value }))}
              options={mainAccountOptions}
              placeholder="Select parent main account"
              label="Main Account"
              icon={Building2}
            />
          )}

          <CustomInput
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={`Enter ${type} account name`}
            label="Account Name"
            icon={type === 'main' ? Building2 : FolderOpen}
            required
          />

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.name || (type === 'main' && !formData.financial_statement_component) || isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                formData.name && (type === 'sub' || formData.financial_statement_component)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ 
                  width: `${
                    type === 'main' 
                      ? (formData.financial_statement_component ? 50 : 0) + (formData.name ? 50 : 0)
                      : (formData.main_account_code ? 50 : 0) + (formData.name ? 50 : 0)
                  }%` 
                }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {type === 'main' 
                ? `${(formData.financial_statement_component ? 1 : 0) + (formData.name ? 1 : 0)}/2`
                : `${(formData.main_account_code ? 1 : 0) + (formData.name ? 1 : 0)}/2`
              } completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}