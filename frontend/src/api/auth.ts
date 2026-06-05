import { post } from '@/utils/request'

export interface LoginDTO {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: {
    id: number
    username: string
    role: string
    avatar?: string
  }
}

export const authApi = {
  login: (data: LoginDTO) => post<LoginResult>('/auth/login', data),
  logout: () => post<null>('/auth/logout'),
}
