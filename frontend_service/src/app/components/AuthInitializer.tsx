'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from '@/app/store/authSlice';

/**
 * Component that initializes auth state from localStorage
 * This should be placed at the root level of your app (in layout.tsx)
 */
export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth from localStorage on app initialization
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      if (accessToken && userId) {
        // Get user info from localStorage
        const firstName = localStorage.getItem('firstName') || '';
        const lastName = localStorage.getItem('lastName') || '';

        dispatch(
          restoreAuth({
            user: {
              userId,
              firstName,
              lastName,
              email: userEmail || undefined,
            },
            accessToken,
            // refreshToken is in httpOnly cookie, automatically sent with requests
          })
        );
      }
    }
  }, [dispatch]);

  return null;
}
