'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/app/store/authSlice';
import { RootState } from '@/app/store/store';
import { apiPost } from '@/lib/api';

export function LogoutButton() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to revoke refresh token cookie
      await apiPost('/auth/logout', {});

      // Clear Redux store
      dispatch(clearAuth());

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        // refreshToken is in httpOnly cookie, no need to clear from localStorage
      }

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if backend call fails
      dispatch(clearAuth());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
      }
      router.push('/login');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Logout
    </button>
  );
}
