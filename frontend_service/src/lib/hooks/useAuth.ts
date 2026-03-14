import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';

/**
 * Hook to access auth state
 * Usage:
 * const { user, isAuthenticated, accessToken } = useAuth();
 */
export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    accessToken: auth.accessToken,
    isLoading: auth.isLoading,
    error: auth.error,
    isGuest: auth.isGuest,
    guestId: auth.guestId,
  };
}
