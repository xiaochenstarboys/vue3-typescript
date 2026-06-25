/** 订单状态：已预订 / 已入住 / 已退房 / 已取消 */
export type OrderStatus = 'reserved' | 'checked_in' | 'checked_out' | 'cancelled'

export interface Order {
  id: number
  orderNo: string
  guestName: string
  guestPhone: string
  guestIdCard?: string
  roomId: number
  /** join 字段：房号 */
  roomNumber?: string
  /** join 字段：房型 id */
  typeId?: number
  /** join 字段：房型名 */
  typeName?: string
  /** join 字段：基础房价 */
  basePrice?: number
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  deposit: number
  status: OrderStatus
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDTO {
  guestName: string
  guestPhone: string
  guestIdCard?: string
  roomId: number
  checkIn: string
  checkOut: string
  deposit?: number
  remark?: string
}

export type UpdateOrderDTO = Partial<CreateOrderDTO> & { id: number }
