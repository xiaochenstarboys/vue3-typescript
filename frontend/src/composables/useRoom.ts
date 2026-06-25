import { ref, reactive } from 'vue'
import type { RoomType, Room, CreateRoomTypeDTO, CreateRoomDTO, RoomStatus } from '@/types/room'
import { roomTypeApi, roomApi, type RoomListQuery } from '@/api/room'
import { ElMessage } from 'element-plus'

export function useRoom() {
  const roomTypes = ref<RoomType[]>([])
  const rooms = ref<Room[]>([])
  const loading = ref(false)

  /** 客房搜索条件 */
  const roomQuery = reactive<RoomListQuery>({
    typeId: undefined,
    keyword: '',
    status: '',
    floor: undefined,
  })

  async function fetchRoomTypes() {
    loading.value = true
    try {
      roomTypes.value = await roomTypeApi.getList()
    } finally {
      loading.value = false
    }
  }

  /** 拉取客房列表，应用 roomQuery 中的筛选条件 */
  async function fetchRooms(typeId?: number) {
    const params: RoomListQuery = { ...roomQuery }
    if (typeId !== undefined) params.typeId = typeId
    if (!params.keyword) delete params.keyword
    if (!params.status) delete params.status
    if (!params.floor) delete params.floor
    rooms.value = await roomApi.getList(params)
  }

  async function createRoomType(data: CreateRoomTypeDTO) {
    await roomTypeApi.create(data)
    ElMessage.success('房型创建成功')
    await fetchRoomTypes()
  }

  async function updateRoomType(id: number, data: Partial<CreateRoomTypeDTO>) {
    await roomTypeApi.update(id, data)
    ElMessage.success('房型信息已更新')
    await fetchRoomTypes()
  }

  async function removeRoomType(id: number) {
    await roomTypeApi.remove(id)
    ElMessage.success('已删除')
    await fetchRoomTypes()
  }

  async function createRoom(data: CreateRoomDTO) {
    await roomApi.create(data)
    ElMessage.success('客房创建成功')
    await fetchRooms()
  }

  async function removeRoom(id: number) {
    await roomApi.remove(id)
    ElMessage.success('已删除')
    await fetchRooms()
  }

  /** 切换房态（清扫完成等） */
  async function updateRoomStatus(id: number, status: RoomStatus) {
    await roomApi.updateStatus(id, status)
    await fetchRooms()
  }

  return {
    roomTypes, rooms, loading, roomQuery,
    fetchRoomTypes, fetchRooms,
    createRoomType, updateRoomType, removeRoomType,
    createRoom, removeRoom, updateRoomStatus,
  }
}
