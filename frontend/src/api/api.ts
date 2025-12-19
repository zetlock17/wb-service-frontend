import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
// import { refreshToken } from './sessionService';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

let apiErrorCallback: ((error: string | null) => void) | null = null;

export const registerApiErrorHandler = (callback: (error: string | null) => void) => {
  apiErrorCallback = callback;
};

const handleApiError = (error: any, url: string) => {
  console.error(`API error for ${url}:`, error);
  
  if (error.response?.status >= 400 || !error.response) {
    const errorMessage = error.response?.data?.message || error.message || 'Ошибка сервера ';
    if (apiErrorCallback) {
      apiErrorCallback(errorMessage);
    }
  }
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getRequest = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.get(url, { params });
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

export const deleteRequest = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.delete(url);
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