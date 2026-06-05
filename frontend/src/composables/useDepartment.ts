import { ref } from 'vue'
import type { Department, CreateDepartmentDTO } from '@/types/department'
import { departmentApi } from '@/api/department'
import { ElMessage } from 'element-plus'

export function useDepartment() {
  const tree = ref<Department[]>([])
  const flat = ref<Pick<Department, 'id' | 'name' | 'parentId'>[]>([])
  const loading = ref(false)

  async function fetchTree() {
    loading.value = true
    try {
      tree.value = await departmentApi.getTree()
    } finally {
      loading.value = false
    }
  }

  async function fetchFlat() {
    flat.value = await departmentApi.getFlat()
  }

  async function createDept(data: CreateDepartmentDTO) {
    await departmentApi.create(data)
    ElMessage.success('部门创建成功')
    await fetchTree()
    await fetchFlat()
  }

  async function updateDept(id: number, data: Partial<CreateDepartmentDTO>) {
    await departmentApi.update(id, data)
    ElMessage.success('部门信息已更新')
    await fetchTree()
  }

  async function removeDept(id: number) {
    await departmentApi.remove(id)
    ElMessage.success('已删除')
    await fetchTree()
  }

  return { tree, flat, loading, fetchTree, fetchFlat, createDept, updateDept, removeDept }
}
