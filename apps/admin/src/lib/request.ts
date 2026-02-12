import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  timeout: 10000,
  withCredentials: true,
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
    // 自动解包后端返回的 { code, message, data } 格式
    const res = response.data;
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
       // 如果 code 不为 200，视为业务错误（可选，根据需要调整）
       if (res.code !== 200) {
          message.error(res.message || '请求失败');
          return Promise.reject(new Error(res.message || 'Error'));
       }
       return res.data;
    }
    // 兼容旧格式或直接返回的数据
    return res;
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
