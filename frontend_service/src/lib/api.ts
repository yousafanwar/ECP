import store, { type RootState } from "@/app/store/store";
import { setAccessToken, clearAuth } from "@/app/store/authSlice";

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
