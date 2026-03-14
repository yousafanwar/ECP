import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isGuest: false,
  guestId: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user and access token after successful login/register
    // Refresh token is stored in httpOnly cookie automatically
    setAuth: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isGuest = false;
      state.guestId = null;
      state.error = null;
    },

    // Set guest session
    setGuestSession: (
      state,
      action: PayloadAction<{ guestId: string; accessToken: string }>
    ) => {
      state.isGuest = true;
      state.guestId = action.payload.guestId;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },

    // Clear guest session
    clearGuestSession: (state) => {
      state.isGuest = false;
      state.guestId = null;
    },

    // Update only the access token (after refresh)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    // Clear auth state (logout)
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      state.guestId = null;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Restore auth from localStorage (called on app initialization)
    restoreAuth: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
      } | null>
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  setAuth,
  setAccessToken,
  clearAuth,
  setLoading,
  setError,
  restoreAuth,
  setGuestSession,
  clearGuestSession,
} = authSlice.actions;

export default authSlice.reducer;
