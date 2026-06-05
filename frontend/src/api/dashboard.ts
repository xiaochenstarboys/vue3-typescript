import { get } from '@/utils/request'

export interface DashboardStats {
  totalEmployees: number
  departmentCount: number
  monthlyHires: number
  inactiveCount: number
  turnoverRate: number
}

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard/stats'),
}
