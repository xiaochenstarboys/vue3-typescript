import { ref, reactive } from 'vue'
import type { PageQuery } from '@/types/api'
import type { Order, CreateOrderDTO } from '@/types/order'
import { orderApi } from '@/api/order'
import { ElMessage } from 'element-plus'

export function useOrder() {
  const list = ref<Order[]>([])
  const total = ref(0)
  const loading = ref(false)

  const query = reactive<PageQuery>({
    page: 1,
    pageSize: 10,
    keyword: '',
    roomTypeId: undefined,
    status: '',
  })

  async function fetchList() {
    loading.value = true
    try {
      const params: PageQuery = { ...query }
      if (!params.status) delete params.status
      if (!params.keyword) delete params.keyword
      if (!params.roomTypeId) delete params.roomTypeId
      const result = await orderApi.getList(params)
      list.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data: CreateOrderDTO) {
    await orderApi.create(data)
    ElMessage.success('预订成功')
    await fetchList()
  }

  async function updateOrder(id: number, data: Partial<CreateOrderDTO>) {
    await orderApi.update(id, data)
    ElMessage.success('订单信息已更新')
    await fetchList()
  }

  async function removeOrder(id: number) {
    await orderApi.remove(id)
    ElMessage.success('已删除')
    await fetchList()
  }

  async function batchRemove(ids: number[]) {
    await orderApi.batchRemove(ids)
    ElMessage.success(`已删除 ${ids.length} 条记录`)
    await fetchList()
  }

  /** 办理入住 */
  async function checkIn(id: number) {
    await orderApi.checkIn(id)
    ElMessage.success('已办理入住')
    await fetchList()
  }

  /** 办理退房 */
  async function checkOut(id: number) {
    await orderApi.checkOut(id)
    ElMessage.success('已办理退房')
    await fetchList()
  }

  /** 取消订单 */
  async function cancelOrder(id: number) {
    await orderApi.cancel(id)
    ElMessage.success('已取消订单')
    await fetchList()
  }

  function resetQuery() {
    query.page = 1
    query.keyword = ''
    query.roomTypeId = undefined
    query.status = ''
    fetchList()
  }

  return {
    list, total, loading, query, fetchList,
    createOrder, updateOrder, removeOrder, batchRemove,
    checkIn, checkOut, cancelOrder, resetQuery,
  }
}
