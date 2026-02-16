import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { refreshToken } from './authApi';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/authTokens';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
  skipAuthRedirect?: boolean;
  isRefreshRequest?: boolean;
}

let apiErrorCallback: ((error: string | null) => void) | null = null;

export const registerApiErrorHandler = (callback: (error: string | null) => void) => {
  apiErrorCallback = callback;
};

const isAuthTokenEndpoint = (url?: string) => {
  return Boolean(url && (url.includes('/protocol/openid-connect/token') || url.includes('/realms/')));
};

const handleApiError = (error: any, url: string, config?: ApiRequestConfig) => {
  console.error(`API error for ${url}:`, error);
  
  if (error.response?.status >= 400 || !error.response) {
    const errorMessage = error.response?.data?.message || error.message || 'Ошибка сервера ';
    if (error.response?.status === 401) {
      // Не редиректим здесь, если это auth endpoint или если уже был retry
      // Интерцептор уже попытался сделать refresh выше
      if (config?.skipAuthRedirect || isAuthTokenEndpoint(url) || config?._retry) {
        console.warn('[API] 401 on retry or auth endpoint, skipping redirect');
        return;
      }
      // Если это первый запрос который вернул 401 но не является auth запросом,
      // то интерцептор ДОЛЖЕН был уже попытаться refresh.
      // Если мы здесь - значит refresh не сработал и интерцептор уже вызвал clearAuthAndRedirect
      console.warn('[API] 401 after interceptor processing, tokens already cleared');
      return;
    }
    else if (apiErrorCallback) {
      apiErrorCallback(errorMessage);
    }
  }
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const clearAuthAndRedirect = () => {
  clearTokens();
  window.location.href = '/login';
};

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const flushQueue = (error: any, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log('[API Request]', config.url, '| has token:', !!token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as ApiRequestConfig | undefined;
    const status = error.response?.status;

    console.log('[API Response Error] Status:', status, 'URL:', originalRequest?.url, 'skipAuthRefresh:', originalRequest?.skipAuthRefresh);

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      console.warn('[API] Token refresh already attempted, rejecting request');
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh) {
      console.log('[API] Request marked to skip auth refresh, rejecting');
      return Promise.reject(error);
    }

    const refreshTokenValue = getRefreshToken();
    console.log('[API] Refresh token available:', !!refreshTokenValue);
    if (!refreshTokenValue) {
      console.error('[API] No refresh token available, clearing auth');
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      console.log('[API] Already refreshing, queuing request');
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('[API] Starting token refresh, refreshTokenValue length:', refreshTokenValue?.length);
      const refreshResponse = await refreshToken(refreshTokenValue);
      console.log('[API] Refresh response status:', refreshResponse.status);
      
      if (refreshResponse.status < 200 || refreshResponse.status >= 300) {
        console.error('[API] Token refresh failed with status:', refreshResponse.status, 'message:', refreshResponse.message);
        throw new Error(refreshResponse.message || 'Refresh token failed');
      }
      
      console.log('[API] Token refresh successful, new access_token received');

      const newAccessToken = refreshResponse.data.access_token;
      const newRefreshToken = refreshResponse.data.refresh_token;
      const resolvedRefreshToken = newRefreshToken || refreshTokenValue;

      if (!newAccessToken) {
        throw new Error('Missing access token in refresh response');
      }

      setTokens({
        accessToken: newAccessToken,
        refreshToken: resolvedRefreshToken,
        accessMaxAgeSec: refreshResponse.data.expires_in,
        refreshMaxAgeSec: refreshResponse.data.refresh_expires_in,
      });

      flushQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      console.error('[API] Token refresh failed:', refreshError);
      flushQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getRequest = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.get(url, { params });
    console.log('GET response:', response);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const patchRequest = async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.patch(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const postRequest = async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.post(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const postFormRequest = async <T>(
  url: string,
  data: URLSearchParams,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    console.log('[postFormRequest] URL:', url, 'skipAuthRefresh:', config?.skipAuthRefresh);
    const response: AxiosResponse<T> = await api.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...config,
    });
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url, config);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const deleteRequest = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.delete(url, { params });
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
}

export const putRequest = async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.put(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
}