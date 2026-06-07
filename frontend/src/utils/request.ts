import axios, { type AxiosResponse } from 'axios'
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
    // 拦截器解包 ApiResponse 包装，只返回 data 字段
    // Axios 类型系统不感知此转换，通过 unknown 桥接
    return data as unknown as AxiosResponse
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParamLike = Record<string, any>

export async function get<T>(url: string, params?: ParamLike): Promise<T> {
  return instance.get<ApiResponse<T>>(url, { params }) as unknown as Promise<T>
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  return instance.post<ApiResponse<T>>(url, data) as unknown as Promise<T>
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  return instance.put<ApiResponse<T>>(url, data) as unknown as Promise<T>
}

export async function del<T>(url: string, data?: unknown): Promise<T> {
  return instance.delete<ApiResponse<T>>(url, { data }) as unknown as Promise<T>
}
