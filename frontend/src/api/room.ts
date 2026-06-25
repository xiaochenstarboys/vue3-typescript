import { get, post, put, del, patch } from '@/utils/request'
import type { RoomType, Room, CreateRoomTypeDTO, CreateRoomDTO } from '@/types/room'

export const roomTypeApi = {
  getList: () => get<RoomType[]>('/room-types'),
  getById: (id: number) => get<RoomType>(`/room-types/${id}`),
  create: (data: CreateRoomTypeDTO) => post<{ id: number }>('/room-types', data),
  update: (id: number, data: Partial<CreateRoomTypeDTO>) => put<null>(`/room-types/${id}`, data),
  remove: (id: number) => del<null>(`/room-types/${id}`),
}

export interface RoomListQuery {
  typeId?: number
  keyword?: string
  status?: string
  floor?: number
}

export const roomApi = {
  /** 不传 typeId 查全部；传 typeId 查指定房型下的客房。支持 keyword/status/floor 筛选 */
  getList: (params?: RoomListQuery) => get<Room[]>('/rooms', params as Record<string, unknown> | undefined),
  getById: (id: number) => get<Room>(`/rooms/${id}`),
  create: (data: CreateRoomDTO) => post<{ id: number }>('/rooms', data),
  update: (id: number, data: Partial<CreateRoomDTO>) => put<null>(`/rooms/${id}`, data),
  /** 改房态 */
  updateStatus: (id: number, status: Room['status']) => patch<null>(`/rooms/${id}/status`, { status }),
  remove: (id: number) => del<null>(`/rooms/${id}`),
}
