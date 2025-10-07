// 'use client';
// import { useState, useEffect, useCallback, KeyboardEvent, useRef } from 'react';
// import { Search } from 'lucide-react';

// export interface SearchableOption {
//   id: number | string;
//   code?: string;
//   label: string;
//   secondaryLabel?: string;
// }

// interface SearchableSelectProps<T extends SearchableOption> {
//   value?: T;
//   onSearch: (query: string) => Promise<T[]>;
//   onChange: (option: T | undefined) => void;
//   placeholder?: string;
//   disabled?: boolean;
//   isLoading?: boolean;
//   error?: string;
//   clearable?: boolean;
//   minSearchLength?: number;
//   label?: string;
// }

// export function SearchableSelect<T extends SearchableOption>({
//   value,
//   onSearch,
//   onChange,
//   placeholder = 'Search...',
//   disabled = false,
//   isLoading = false,
//   error,
//   clearable = true,
//   minSearchLength = 0,
//   label
// }: SearchableSelectProps<T>) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [options, setOptions] = useState<T[]>([]);
//   const [selectedIndex, setSelectedIndex] = useState(-1);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const listRef = useRef<HTMLDivElement>(null);

//   const debouncedSearch = useCallback((query: string) => {
//     const timeoutId = setTimeout(async () => {
//       if (query.length >= minSearchLength) {
//         try {
//           const results = await onSearch(query);
//           setOptions(results);
//           setSelectedIndex(-1);
//         } catch (err) {
//           console.error('Search failed:', err);
//           setOptions([]);
//         }
//       } else {
//         setOptions([]);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [onSearch, minSearchLength]);

//   useEffect(() => {
//     const cleanup = debouncedSearch(searchTerm);
//     return cleanup;
//   }, [searchTerm, debouncedSearch]);

//   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (!isOpen) return;

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault();
//         setSelectedIndex(prev => {
//           const next = prev + 1 >= options.length ? 0 : prev + 1;
//           scrollToOption(next);
//           return next;
//         });
//         break;

//       case 'ArrowUp':
//         e.preventDefault();
//         setSelectedIndex(prev => {
//           const next = prev - 1 < 0 ? options.length - 1 : prev - 1;
//           scrollToOption(next);
//           return next;
//         });
//         break;

//       case 'Enter':
//         e.preventDefault();
//         if (selectedIndex >= 0 && selectedIndex < options.length) {
//           selectOption(options[selectedIndex]);
//         }
//         break;

//       case 'Escape':
//         e.preventDefault();
//         setIsOpen(false);
//         break;
//     }
//   };

//   const scrollToOption = (index: number) => {
//     if (!listRef.current) return;
//     const option = listRef.current.children[index] as HTMLElement;
//     if (option) {
//       option.scrollIntoView({
//         block: 'nearest',
//         behavior: 'smooth'
//       });
//     }
//   };

//   const selectOption = (option: T) => {
//     onChange(option);
//     setSearchTerm('');
//     setIsOpen(false);
//     setOptions([]);
//   };

//   return (
//     <div className="relative">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//         <input
//           ref={inputRef}
//           type="text"
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setIsOpen(true);
//           }}
//           onFocus={() => setIsOpen(true)}
//           onKeyDown={handleKeyDown}
//           placeholder={placeholder}
//           className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
//             error ? 'border-red-500' : 'border-gray-300'
//           } ${disabled ? 'bg-gray-100' : ''}`}
//           disabled={disabled}
//         />
//         {isLoading && (
//           <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//             <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
//           </div>
//         )}
//       </div>

//       {value && !searchTerm && (
//         <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
//           <div>
//             {value.code && (
//               <p className="text-sm font-medium text-blue-900">{value.code}</p>
//             )}
//             <p className="text-sm text-blue-700">{value.label}</p>
//             {value.secondaryLabel && (
//               <p className="text-xs text-blue-600 mt-1">{value.secondaryLabel}</p>
//             )}
//           </div>
//           {clearable && (
//             <button
//               type="button"
//               onClick={() => {
//                 onChange(undefined);
//                 setSearchTerm('');
//                 if (inputRef.current) {
//                   inputRef.current.focus();
//                 }
//               }}
//               className="p-1 hover:bg-blue-100 rounded"
//             >
//               <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M18 6L6 18M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       )}

//       {isOpen && options.length > 0 && (
//         <div
//           ref={listRef}
//           className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
//         >
//           {options.map((option, index) => (
//             <button
//               key={option.id}
//               type="button"
//               onClick={() => selectOption(option)}
//               className={`w-full text-left px-4 py-2 ${
//                 index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
//               } focus:outline-none`}
//             >
//               {option.code && (
//                 <div className="font-medium">{option.code}</div>
//               )}
//               <div className="text-sm text-gray-600">{option.label}</div>
//               {option.secondaryLabel && (
//                 <div className="text-xs text-gray-500">{option.secondaryLabel}</div>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {error && (
//         <p className="mt-1 text-sm text-red-600">{error}</p>
//       )}
//     </div>
//   );
// }


'use client';
import { useState, useEffect, useCallback, KeyboardEvent, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchableOption {
  id: number | string;
  code?: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableSelectProps<T extends SearchableOption> {
  value?: T;
  onSearch: (query: string) => Promise<T[]>;
  onChange: (option: T | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  clearable?: boolean;
  minSearchLength?: number;
  label?: string;
  showBalanceInline?: boolean; // New prop to show balance in same line
}

export function SearchableSelect<T extends SearchableOption>({
  value,
  onSearch,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  isLoading = false,
  error,
  clearable = true,
  minSearchLength = 0,
  label,
  showBalanceInline = false
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(async () => {
      if (query.length >= minSearchLength) {
        try {
          const results = await onSearch(query);
          setOptions(results);
          setSelectedIndex(-1);
        } catch (err) {
          console.error('Search failed:', err);
          setOptions([]);
        }
      } else {
        setOptions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [onSearch, minSearchLength]);

  useEffect(() => {
    const cleanup = debouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debouncedSearch]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev + 1 >= options.length ? 0 : prev + 1;
          scrollToOption(next);
          return next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev - 1 < 0 ? options.length - 1 : prev - 1;
          scrollToOption(next);
          return next;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          selectOption(options[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const scrollToOption = (index: number) => {
    if (!listRef.current) return;
    const option = listRef.current.children[index] as HTMLElement;
    if (option) {
      option.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  };

  const selectOption = (option: T) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
    setOptions([]);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''}`}
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {value && !searchTerm && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {showBalanceInline ? (
                // Single line display for account with balance
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {value.code && (
                      <span className="text-sm font-medium text-blue-900">{value.code}</span>
                    )}
                    <span className="text-sm text-blue-700">{value.label}</span>
                  </div>
                  {value.secondaryLabel && (
                    <span className="text-xs text-blue-600 font-medium">
                      {value.secondaryLabel}
                    </span>
                  )}
                </div>
              ) : (
                // Multi-line display (original)
                <div>
                  {value.code && (
                    <p className="text-sm font-medium text-blue-900">{value.code}</p>
                  )}
                  <p className="text-sm text-blue-700">{value.label}</p>
                  {value.secondaryLabel && (
                    <p className="text-xs text-blue-600 mt-1">{value.secondaryLabel}</p>
                  )}
                </div>
              )}
            </div>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setSearchTerm('');
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className="p-1 hover:bg-blue-100 rounded ml-2 flex-shrink-0"
              >
                <X className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {isOpen && options.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              } focus:outline-none focus:bg-blue-50`}
            >
              {showBalanceInline ? (
                // Single line display in dropdown
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {option.code && (
                      <span className="font-medium text-gray-900">{option.code}</span>
                    )}
                    <span className="text-sm text-gray-600">{option.label}</span>
                  </div>
                  {option.secondaryLabel && (
                    <span className="text-xs text-gray-500 font-medium ml-2">
                      {option.secondaryLabel}
                    </span>
                  )}
                </div>
              ) : (
                // Multi-line display in dropdown (original)
                <div>
                  {option.code && (
                    <div className="font-medium text-gray-900">{option.code}</div>
                  )}
                  <div className="text-sm text-gray-600">{option.label}</div>
                  {option.secondaryLabel && (
                    <div className="text-xs text-gray-500 mt-1">{option.secondaryLabel}</div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}