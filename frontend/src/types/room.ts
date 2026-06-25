/** 房态：空闲 / 入住 / 脏房 / 维修 */
export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance'

export interface RoomType {
  id: number
  name: string
  basePrice: number
  bedType: string
  area?: number
  maxGuests: number
  description?: string
  /** join 统计：客房总数 */
  roomCount?: number
  /** join 统计：空闲数 */
  availableCount?: number
  createdAt: string
}

export interface Room {
  id: number
  roomNumber: string
  floor: number
  typeId: number
  status: RoomStatus
  /** join 字段：房型名 */
  typeName?: string
  /** join 字段：基础房价 */
  basePrice?: number
  createdAt: string
  updatedAt: string
}

export type CreateRoomTypeDTO = Omit<RoomType, 'id' | 'createdAt' | 'roomCount' | 'availableCount'>
export type UpdateRoomTypeDTO = Partial<CreateRoomTypeDTO> & { id: number }

export type CreateRoomDTO = Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'typeName' | 'basePrice'>
export type UpdateRoomDTO = Partial<CreateRoomDTO> & { id: number }
