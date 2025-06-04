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
    <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard Overview</h1>
          {isMounted && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>📅 {date}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button 
            onClick={handleProfileToggle}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <p className="font-medium capitalize">
                  {userInfo?.name ?? 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {userInfo?.email ?? 'No email'}
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Role: {userInfo?.role ?? 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
