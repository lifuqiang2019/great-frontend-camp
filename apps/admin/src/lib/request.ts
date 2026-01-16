import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '请求失败';
    message.error(msg);
    return Promise.reject(error);
  }
);

// 封装常用方法以匹配拦截器返回的数据类型
const http = {
  get: <T = any>(url: string, config?: any) => request.get<T, T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => request.post<T, T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => request.put<T, T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => request.patch<T, T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => request.delete<T, T>(url, config),
};

export default http;
