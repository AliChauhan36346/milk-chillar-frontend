//components/layouts/Header.tsx
'use client';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// Add these types for Google Translate globals
// @ts-ignore
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

type HeaderProps = {
  toggleSidebar: () => void;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
};

export default function Header({ toggleSidebar, role }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Language toggle state
  const [language, setLanguage] = useState<'en' | 'ur'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as 'en' | 'ur') || 'en';
    }
    return 'en';
  });
  const googleTranslateRef = useRef<HTMLDivElement>(null);

  // Inject Google Translate script once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-translate-script')) return;
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
    // Define the callback globally
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,ur',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
    };
  }, []);

  // Change language when toggle is switched
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('language', language);
    // Wait for the Google Translate dropdown to appear, then set the language
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds (20 * 100ms)
    function trySetLanguage() {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = language === 'en' ? 'en' : 'ur';
        select.dispatchEvent(new Event('change'));
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(trySetLanguage, 100);
      }
    }
    trySetLanguage();
  }, [language]);

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
        {/* Left side - Menu button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Right side - Notifications, Language Toggle, and User menu */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <div id="google_translate_element" ref={googleTranslateRef} style={{ display: 'none' }} />
            <div className="flex items-center">
              <span className={`text-xs font-semibold transition-colors duration-200 ${language === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>EN</span>
              <button
                type="button"
                aria-label="Toggle language"
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className={`mx-2 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${language === 'ur' ? 'bg-blue-600' : 'bg-gray-300'}`}
                style={{ minWidth: '48px' }}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${language === 'ur' ? 'translate-x-6' : 'translate-x-0'}`}
                  style={{ display: 'inline-block' }}
                />
              </button>
              <span className={`text-xs font-semibold transition-colors duration-200 ${language === 'ur' ? 'text-blue-600' : 'text-gray-400'}`}>اردو</span>
            </div>
          </div>

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
    </header>
  );
}
