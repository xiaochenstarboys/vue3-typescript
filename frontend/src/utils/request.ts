import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data
    if (code !== 200 && code !== 201) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return data as any
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for login endpoint — wrong password is a normal error
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    ElMessage.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error)
  }
)

export const get = <T>(url: string, params?: object): Promise<T> =>
  instance.request<T, T>({ method: 'GET', url, params })

export const post = <T>(url: string, data?: object): Promise<T> =>
  instance.request<T, T>({ method: 'POST', url, data })

export const put = <T>(url: string, data?: object): Promise<T> =>
  instance.request<T, T>({ method: 'PUT', url, data })

export const del = <T>(url: string, data?: object): Promise<T> =>
  instance.request<T, T>({ method: 'DELETE', url, data })

export default instance
