import axios from 'axios';

// 基础实例 - API
const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true,
});

apiInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const api = {
  get: <T = any>(url: string, config?: any) => apiInstance.get<T, T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiInstance.post<T, T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => apiInstance.put<T, T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => apiInstance.patch<T, T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => apiInstance.delete<T, T>(url, config),
};

// 基础实例 - 通用请求
const requestInstance = axios.create({
  timeout: 10000,
});

requestInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const request = {
  get: <T = any>(url: string, config?: any) => requestInstance.get<T, T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => requestInstance.post<T, T>(url, data, config),
};
