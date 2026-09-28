// //components/layouts/Header.tsx
// 'use client';
// import { Menu, Bell, Search } from 'lucide-react';
// import { useAuth } from '@/lib/auth/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useState, useEffect, useRef } from 'react';

// // Add these types for Google Translate globals
// // @ts-ignore
// declare global {
//   interface Window {
//     googleTranslateElementInit?: () => void;
//     google?: any;
//   }
// }

// type HeaderProps = {
//   toggleSidebar: () => void;
//   role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
// };

// export default function Header({ toggleSidebar, role }: HeaderProps) {
//   const { user, logout } = useAuth();
//   const router = useRouter();

//   // Language toggle state
//   const [language, setLanguage] = useState<'en' | 'ur'>(() => {
//     if (typeof window !== 'undefined') {
//       return (localStorage.getItem('language') as 'en' | 'ur') || 'en';
//     }
//     return 'en';
//   });
//   const googleTranslateRef = useRef<HTMLDivElement>(null);

//   // Inject Google Translate script once
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     if (document.getElementById('google-translate-script')) return;
//     const script = document.createElement('script');
//     script.id = 'google-translate-script';
//     script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
//     document.body.appendChild(script);
//     // Define the callback globally
//     window.googleTranslateElementInit = function () {
//       new window.google.translate.TranslateElement({
//         pageLanguage: 'en',
//         includedLanguages: 'en,ur',
//         layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//         autoDisplay: false,
//       }, 'google_translate_element');
//     };
//   }, []);

//   // Change language when toggle is switched
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem('language', language);
//     // Wait for the Google Translate dropdown to appear, then set the language
//     let attempts = 0;
//     const maxAttempts = 20; // 2 seconds (20 * 100ms)
//     function trySetLanguage() {
//       const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
//       if (select) {
//         select.value = language === 'en' ? 'en' : 'ur';
//         select.dispatchEvent(new Event('change'));
//       } else if (attempts < maxAttempts) {
//         attempts++;
//         setTimeout(trySetLanguage, 100);
//       }
//     }
//     trySetLanguage();
//   }, [language]);

//   const handleSignOut = async () => {
//     try {
//       await logout();
//       router.push('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <header className="bg-white border-b border-gray-200">
//       <div className="flex items-center justify-between px-4 py-3">
//         {/* Left side - Menu button */}
//         <button
//           onClick={toggleSidebar}
//           className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
//           aria-label="Toggle sidebar"
//         >
//           <Menu size={20} />
//         </button>

//         {/* Right side - Notifications, Language Toggle, and User menu */}
//         <div className="flex items-center gap-4">
//           <button
//             className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative"
//             aria-label="Notifications"
//           >
//             <Bell size={20} />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>

//           {/* Language Toggle */}
//           <div className="flex items-center gap-2">
//             <div id="google_translate_element" ref={googleTranslateRef} style={{ display: 'none' }} />
//             <div className="flex items-center">
//               <span className={`text-xs font-semibold transition-colors duration-200 ${language === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>EN</span>
//               <button
//                 type="button"
//                 aria-label="Toggle language"
//                 onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
//                 className={`mx-2 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${language === 'ur' ? 'bg-blue-600' : 'bg-gray-300'}`}
//                 style={{ minWidth: '48px' }}
//               >
//                 <span
//                   className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${language === 'ur' ? 'translate-x-6' : 'translate-x-0'}`}
//                   style={{ display: 'inline-block' }}
//                 />
//               </button>
//               <span className={`text-xs font-semibold transition-colors duration-200 ${language === 'ur' ? 'text-blue-600' : 'text-gray-400'}`}>اردو</span>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-sm font-medium text-gray-900">{user?.username}</p>
//               <p className="text-xs text-gray-500 capitalize">{role}</p>
//             </div>
//             <button
//               onClick={handleSignOut}
//               className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
//             >
//               <span className="text-blue-600 text-sm font-medium">
//                 {user?.username?.charAt(0).toUpperCase() || 'U'}
//               </span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
'use client';
import { Menu, Calendar, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useFinancialYear } from '@/context/FinancialYearContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

type HeaderProps = {
  toggleSidebar: () => void;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
};

export default function Header({ toggleSidebar, role }: HeaderProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'admin';
  const { financialYears, activeYear, selectedYear, isHistoricalMode, setSelectedYear } = useFinancialYear();
  const [isFyDropdownOpen, setIsFyDropdownOpen] = useState(false);
  const fyDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(e.target as Node)) {
        setIsFyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button & Financial Year Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Financial Year Selector - Only visible for Admin */}
          {isAdmin && (
            <div className="relative" ref={fyDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFyDropdownOpen(!isFyDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isHistoricalMode
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calendar size={14} className={isHistoricalMode ? 'text-amber-600' : 'text-blue-600'} />
                <span className="font-semibold text-slate-800">
                  {selectedYear?.name || activeYear?.name || 'Financial Year'}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    selectedYear?.isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedYear?.isActive ? 'Active' : 'Closed'}
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isFyDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Financial Year
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {financialYears.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">Loading periods...</div>
                    ) : (
                      financialYears.map((fy) => {
                        const isSelected = selectedYear?.financialYearId === fy.financialYearId;
                        return (
                          <button
                            key={fy.financialYearId}
                            type="button"
                            onClick={() => {
                              setSelectedYear(fy);
                              setIsFyDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium flex items-center gap-1.5">
                                {fy.name}
                                {fy.isActive && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-green-100 text-green-700 rounded font-bold">
                                    Current
                                  </span>
                                )}
                                {fy.isClosed && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                                    Closed
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(fy.startDate).toLocaleDateString()} - {new Date(fy.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            {isSelected && <Check size={14} className="text-blue-600" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <span className="text-blue-600 text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Mode Read-Only Banner */}
      {isHistoricalMode && activeYear && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-100" />
            <span>
              You are browsing historical records for <strong>{selectedYear?.name}</strong> (Read-Only). Operations & data entry must be performed in the active year.
            </span>
          </div>
          <button
            onClick={() => setSelectedYear(activeYear)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Return to Current FY ({activeYear.name})</span>
          </button>
        </div>
      )}
    </header>
  );
}