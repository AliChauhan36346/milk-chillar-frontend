// app/login/page.tsx
'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { API_BASE_URL } from '@/lib/api/api';
import { AlertCircle } from 'lucide-react';
import { FullPageSpinner } from '@/components/ui/spinner';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner message="Loading login portal..." />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSessionExpired = searchParams.get('sessionExpired') === 'true';
  const callbackUrl = searchParams.get('callbackUrl');

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

    const sanitizedUsername = username.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: sanitizedUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid username or password');
      }

      login(data.token, data.user);

      // If a valid internal callbackUrl was requested, redirect back there
      if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('/login')) {
        router.push(callbackUrl);
        return;
      }

      const role = data.user?.role?.toLowerCase();
      const redirectPaths = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        dodhi: '/dashboard/dodhi',
        chillarincharge: '/dashboard/ChillarIncharge'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 sm:p-6 lg:p-8">
      <form
        onSubmit={handleLogin}
        className="bg-white/95 backdrop-blur-sm border border-blue-100/50 p-6 sm:p-8 rounded-xl shadow-2xl shadow-blue-100/30 w-full max-w-md transition-all hover:shadow-blue-100/50"
      >
        <div className="mb-6 text-center">
          <div className="mb-4 flex flex-col items-center">
            <img src="/images/dairify-logo.png" alt="Dairify Logo" className="h-16 w-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Dairify</h2>
          </div>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        {isSessionExpired && !error && (
          <div className="mb-5 p-3.5 bg-amber-50 text-amber-800 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Session Expired</strong>
              Your session has expired due to inactivity. Please log in again to continue where you left off.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 text-gray-800 font-medium text-sm"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 text-gray-800 font-medium text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 px-4 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm shadow-xs`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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

        <div className="mt-5 text-center text-xs text-gray-600">
          Don’t have an account?{' '}
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
