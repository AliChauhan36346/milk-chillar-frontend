// app/login/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isInitialized } = useAuth(); // Add isInitialized
  const router = useRouter();

  // Show loading state until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Initializing authentication...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7013/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        //credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid username or password');
      }

      login(data.token, data.user);

      const role = data.user?.role?.toLowerCase();
      const redirectPaths = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        dodhi: '/dashboard/dodhi',
        chillarincharge: '/dashboard/chillarIncharge'
      };
      const redirectPath = role && redirectPaths[role as keyof typeof redirectPaths] 
        ? redirectPaths[role as keyof typeof redirectPaths] 
        : '/dashboard';

      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Render the login form
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 sm:p-6 lg:p-8">
      <form
        onSubmit={handleLogin}
        className="bg-white/95 backdrop-blur-sm border border-blue-100/50 p-6 sm:p-8 rounded-xl shadow-2xl shadow-blue-100/30 w-full max-w-md transition-all hover:shadow-blue-100/50"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {/* Your SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-3.87 0-7 3.13-7 7 0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 11.7V16h-4v-1.3C8.48 13.4 7 11.32 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.32-1.48 4.4-3 5.7z" />
              <path d="M10.5 17.5h3c.28 0 .5.22.5.5v3c0 .28-.22.5-.5.5h-3c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Chauhan Dairies
          </h2>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 text-gray-800 font-medium"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 text-gray-800 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                />
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Signing in...
              </span>
            ) : (
              'Sign in to System'
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
