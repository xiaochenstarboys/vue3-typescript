import type { RoomStatus } from '@/types/room'
import type { OrderStatus } from '@/types/order'

// =============================================
// 床型
// =============================================
export const BED_TYPE_OPTIONS = ['大床', '双床', '单人床', '圆床'] as const

// =============================================
// 房态配置：value → { label, tone }
// tone 对应 global.less 中 .status-badge 的色调 class
// =============================================
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'primary'

export const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; tone: BadgeTone }> = {
  available: { label: '空闲', tone: 'success' },
  occupied: { label: '入住', tone: 'primary' },
  dirty: { label: '脏房', tone: 'warning' },
  maintenance: { label: '维修', tone: 'danger' },
}

export const ROOM_STATUS_OPTIONS: { label: string; value: RoomStatus }[] = [
  { label: '空闲', value: 'available' },
  { label: '入住', value: 'occupied' },
  { label: '脏房', value: 'dirty' },
  { label: '维修', value: 'maintenance' },
]

// =============================================
// 订单状态配置
// =============================================
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  reserved: { label: '已预订', tone: 'info' },
  checked_in: { label: '已入住', tone: 'primary' },
  checked_out: { label: '已退房', tone: 'success' },
  cancelled: { label: '已取消', tone: 'danger' },
}

export const ORDER_STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: '已预订', value: 'reserved' },
  { label: '已入住', value: 'checked_in' },
  { label: '已退房', value: 'checked_out' },
  { label: '已取消', value: 'cancelled' },
]

export const PAGE_SIZES = [10, 20, 50, 100]
