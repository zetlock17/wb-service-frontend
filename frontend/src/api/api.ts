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
        return;
      }
      // Если это первый запрос который вернул 401 но не является auth запросом,
      // то интерцептор ДОЛЖЕН был уже попытаться refresh.
      // Если мы здесь - значит refresh не сработал и интерцептор уже вызвал clearAuthAndRedirect
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

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
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
      const refreshResponse = await refreshToken(refreshTokenValue);
      
      if (refreshResponse.status < 200 || refreshResponse.status >= 300) {
        throw new Error(refreshResponse.message || 'Refresh token failed');
      }

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