'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LogoutButton } from './buttons/LogoutButton';
import Link from 'next/link';

export function Header() {
  const { user, isAuthenticated, isGuest } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4 mb-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition-colors">
            Bird Buzz
          </Link>
        </div>
        
        {isAuthenticated && user && (
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="text-gray-300">Welcome,</p>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 border border-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Profile
            </Link>
            <LogoutButton />
          </div>
        )}

        {!isAuthenticated && isGuest && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Guest</span>
            <Link
              href="/login"
              className="px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 border border-white text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}

        {!isAuthenticated && !isGuest && (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 border border-white text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
