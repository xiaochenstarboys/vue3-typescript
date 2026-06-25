import { get, post, put, del } from '@/utils/request'
import type { Order, CreateOrderDTO } from '@/types/order'
import type { PageResult, PageQuery } from '@/types/api'

export const orderApi = {
  getList: (params: PageQuery) => get<PageResult<Order>>('/orders', params),
  getById: (id: number) => get<Order>(`/orders/${id}`),
  create: (data: CreateOrderDTO) => post<{ id: number; orderNo: string; totalAmount: number }>('/orders', data),
  update: (id: number, data: Partial<CreateOrderDTO>) => put<null>(`/orders/${id}`, data),
  remove: (id: number) => del<null>(`/orders/${id}`),
  batchRemove: (ids: number[]) => del<null>('/orders', { ids }),
  /** 办理入住 */
  checkIn: (id: number) => post<null>(`/orders/${id}/check-in`),
  /** 办理退房 */
  checkOut: (id: number) => post<null>(`/orders/${id}/check-out`),
  /** 取消订单 */
  cancel: (id: number) => post<null>(`/orders/${id}/cancel`),
}
