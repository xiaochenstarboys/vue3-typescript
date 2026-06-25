import { get } from '@/utils/request'

export interface MonthlyRevenue {
  month: string
  /** 当月入账（含在住） */
  income: number
  /** 当月已完成（已退房） */
  completed: number
}

export interface RoomTypeDist {
  name: string
  value: number
}

export interface DashboardStats {
  totalRooms: number
  occupiedRooms: number
  /** 入住率 % */
  occupancyRate: number
  todayCheckIns: number
  todayRevenue: number
  monthlyRevenue: MonthlyRevenue[]
  roomTypeDistribution: RoomTypeDist[]
}

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard/stats'),
}
