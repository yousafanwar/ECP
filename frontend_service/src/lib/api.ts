import store, { type RootState } from "@/app/store/store";
import { setAccessToken, clearAuth, setGuestSession } from "@/app/store/authSlice";

// const API_BASE_URL = "http://localhost:5000";
const API_BASE_URL = "http://192.168.100.58:5000";

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean; // Skip adding auth header for public endpoints
  retryCount?: number; // How many times to retry on 401
}

/**
 * Get the current access token from Redux store
 */
const getAccessToken = (): string | null => {
  const state: RootState = store.getState();
  return state.auth.accessToken;
};

/**
 * Get user ID from Redux store
 */
const getUserId = (): string | null => {
  const state: RootState = store.getState();
  return state.auth.user?.userId || null;
};

/**
 * Refresh the access token using the refresh token cookie
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const userId = getUserId();

  if (!userId) {
    console.error('No userId available for token refresh');
    store.dispatch(clearAuth());
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
      body: JSON.stringify({
        userId, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token refresh failed: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // Update the store with new access token
    store.dispatch(setAccessToken(newAccessToken));

    // Also update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", newAccessToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Clear auth on any refresh failure
    store.dispatch(clearAuth());
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
    }
    return null;
  }
};

/**
 * Main API fetch function with automatic token management
 */
export const apiCall = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const {
    skipAuth = false,
    retryCount = 1,
    headers = {},
    ...restOptions
  } = options;

  // Build full URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  let finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add authorization header if not skipped
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      finalHeaders = {
        ...finalHeaders,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  }

  // Make the request with credentials to include cookies
  let response = await fetch(url, {
    ...restOptions,
    headers: finalHeaders,
    credentials: "include", // Include cookies in request
  });

  // Handle 401 (Unauthorized) - try to refresh token
  if (response.status === 401 && !skipAuth && retryCount > 0) {
    console.log('Received 401, attempting token refresh...');
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      console.log('Token refreshed successfully, retrying request...');
      // Retry the request with new token
      finalHeaders = {
        ...finalHeaders,
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(url, {
        ...restOptions,
        headers: finalHeaders,
        credentials: "include",
      });
    } else {
      console.log('Token refresh failed, user will need to login again');
    }
  }

  return response;
};

/**
 * Convenience method for GET requests
 */
export const apiGet = (endpoint: string, options: ApiRequestOptions = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: "GET",
  });
};

/**
 * Convenience method for POST requests
 */
export const apiPost = (
  endpoint: string,
  body?: any,
  options: ApiRequestOptions = {}
) => {
  return apiCall(endpoint, {
    ...options,
    method: "POST",
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
};

/**
 * Convenience method for PUT requests
 */
export const apiPut = (
  endpoint: string,
  body?: any,
  options: ApiRequestOptions = {}
) => {
  return apiCall(endpoint, {
    ...options,
    method: "PUT",
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
};

/**
 * Convenience method for DELETE requests
 */
export const apiDelete = (endpoint: string, options: ApiRequestOptions = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: "DELETE",
  });
};

/**
 * Used for login/register - no auth header needed
 */
export const apiPublic = (
  endpoint: string,
  options: ApiRequestOptions = {}
) => {
  return apiCall(endpoint, {
    ...options,
    skipAuth: true,
  });
};

// Get guest ID from Redux store

const getGuestId = (): string | null => {
  const state: RootState = store.getState();
  return state.auth.guestId || null;
};


// Check if the current session is a guest session

export const isGuestSession = (): boolean => {
  const state: RootState = store.getState();
  return state.auth.isGuest;
};


// Initialize a guest session — creates a guest user on the backend
// and stores the session in Redux + localStorage.

export const initGuestSession = async (): Promise<string | null> => {
  try {
    const response = await apiPublic('/auth/guest', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Guest session creation failed: ${response.status}`);
    }

    const data = await response.json();

    store.dispatch(
      setGuestSession({
        guestId: data.guest_id,
        accessToken: data.access_token,
      })
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('guestId', data.guest_id);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error creating guest session:', error);
    return null;
  }
};


//  Ensure a session exists — returns the user_id (or guest_id) if
//  authenticated or a guest session is active.
//  Creates a guest session if neither exists.

export const ensureSession = async (): Promise<string | null> => {
  const state: RootState = store.getState();

  // Already authenticated as full user
  if (state.auth.isAuthenticated && state.auth.user?.userId) {
    return state.auth.user.userId;
  }

  // Already a guest
  if (state.auth.isGuest && state.auth.guestId && state.auth.accessToken) {
    return state.auth.guestId;
  }

  // Try to restore from localStorage
  if (typeof window !== 'undefined') {
    const storedGuestId = localStorage.getItem('guestId');
    const storedToken = localStorage.getItem('accessToken');

    if (storedGuestId && storedToken) {
      store.dispatch(
        setGuestSession({ guestId: storedGuestId, accessToken: storedToken })
      );
      return storedGuestId;
    }
  }

  // No session at all — create a guest session
  const token = await initGuestSession();
  if (token) {
    return store.getState().auth.guestId;
  }
  return null;
};


//  Convert a guest session to a registered account.
//  Merges cart and order history.

export const convertGuestToUser = async (registrationData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<Response> => {
  const guestId = getGuestId();

  return apiPublic('/auth/guest/convert', {
    method: 'POST',
    body: JSON.stringify({
      ...registrationData,
      guestId,
    }),
  });
};
