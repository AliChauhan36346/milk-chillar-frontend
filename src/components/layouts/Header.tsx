//components/layouts/Header.tsx
'use client';
import { useEffect, useState } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
//import jwt_decode from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // already installed


type DecodedToken = {
  name: string;
  email: string;
  role: 'admin' | 'manager';
  exp: number;
};

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [date, setDate] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }));
  
    const storedUser = localStorage.getItem('userInfo');
  
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserInfo({
          name: parsed.username,
          email: '-', // use email if you add it in future
          role: parsed.role.toLowerCase(), // 'admin', 'manager', etc.
          exp: 0 // not required unless you're decoding the JWT
        });
      } catch (err) {
        console.error('Invalid userInfo in localStorage', err);
      }
    }
  }, []);
  

  function handleProfileToggle() {
    setIsProfileOpen(prev => !prev);
  }

  function handleLogout(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    Cookies.remove('token'); // 👈 Remove the actual JWT cookie
    window.location.href = '/login';
  }

  return (
    <header className="flex items-center justify-between p-2 bg-white shadow-sm border-b">
      <div className="flex items-center gap-4">
        {/* <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button> */}
        <div>
            <h1 className="text-lg font-semibold text-gray-800">
            {userInfo?.name ? `Welcome, ${userInfo.name}` : 'Dashboard'}
            </h1>
          {isMounted && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>📅 {date}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Bell className="w-5 h-5" />
        </button> */}
        
        <div className="relative">
            <button
            onClick={handleLogout}
            className="flex items-center gap-1 p-1.5 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold shadow transition text-sm"
            title="Logout"
            >
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-600" />
            </span>
            <span>Logout</span>
            </button>
        </div>
      </div>
    </header>
  );
}
