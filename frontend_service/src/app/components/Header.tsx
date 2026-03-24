'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LogoutButton } from './buttons/LogoutButton';
import GoToCartBtn from './buttons/GoToCartBtn';
import Link from 'next/link';

export function Header() {
  const { user, isAuthenticated, isGuest } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-[72px]">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors">
            Bird Buzz
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Shop
            </Link>
          </nav>
        </div>
        
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs text-gray-400">Welcome back</p>
              <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <GoToCartBtn />
            <Link
              href="/profile"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin_panel"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Admin
              </Link>
            )}
            <LogoutButton />
          </div>
        )}

        {!isAuthenticated && isGuest && (
          <div className="flex items-center gap-3">
            <GoToCartBtn />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}

        {!isAuthenticated && !isGuest && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
