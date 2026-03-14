'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth, setGuestSession } from '@/app/store/authSlice';

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
      const guestId = localStorage.getItem('guestId');

      if (accessToken && userId) {
        // Registered user session
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
          })
        );
      } else if (accessToken && guestId) {
        // Guest session
        dispatch(
          setGuestSession({
            guestId,
            accessToken,
          })
        );
      }
    }
  }, [dispatch]);

  return null;
}
