'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LogoutButton } from './buttons/LogoutButton';
import Link from 'next/link';

export function Header() {
  const { user, isAuthenticated } = useAuth();

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
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
