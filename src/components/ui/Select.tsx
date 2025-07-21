import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import ReactDOM from 'react-dom';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  id?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  error,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        ref={buttonRef}
        className={`flex items-center justify-between w-full p-3 text-left rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-300'
        } bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? '' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {/* Portal Dropdown */}
      {isOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div style={dropdownStyles} className="bg-white border border-gray-200 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
          <ul className="py-1 overflow-auto max-h-60">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                  value === option.value ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}