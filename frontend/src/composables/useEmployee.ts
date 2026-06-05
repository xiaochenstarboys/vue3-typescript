import { ref, reactive } from 'vue'
import type { PageQuery } from '@/types/api'
import type { Employee, CreateEmployeeDTO } from '@/types/employee'
import { employeeApi } from '@/api/employee'
import { ElMessage } from 'element-plus'

export function useEmployee() {
  const list = ref<Employee[]>([])
  const total = ref(0)
  const loading = ref(false)

  const query = reactive<PageQuery>({
    page: 1,
    pageSize: 10,
    keyword: '',
    departmentId: undefined,
    status: '',
  })

  async function fetchList() {
    loading.value = true
    try {
      const params: PageQuery = { ...query }
      if (!params.status) delete params.status
      if (!params.keyword) delete params.keyword
      if (!params.departmentId) delete params.departmentId
      const result = await employeeApi.getList(params)
      list.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function createEmployee(data: CreateEmployeeDTO) {
    await employeeApi.create(data)
    ElMessage.success('员工创建成功')
    await fetchList()
  }

  async function updateEmployee(id: number, data: Partial<CreateEmployeeDTO>) {
    await employeeApi.update(id, data)
    ElMessage.success('员工信息已更新')
    await fetchList()
  }

  async function removeEmployee(id: number) {
    await employeeApi.remove(id)
    ElMessage.success('已删除')
    await fetchList()
  }

  async function batchRemove(ids: number[]) {
    await employeeApi.batchRemove(ids)
    ElMessage.success(`已删除 ${ids.length} 条记录`)
    await fetchList()
  }

  function resetQuery() {
    query.page = 1
    query.keyword = ''
    query.departmentId = undefined
    query.status = ''
    fetchList()
  }

  return { list, total, loading, query, fetchList, createEmployee, updateEmployee, removeEmployee, batchRemove, resetQuery }
}
