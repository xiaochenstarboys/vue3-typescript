import { get, post, put, del } from '@/utils/request'
import type { Department, CreateDepartmentDTO } from '@/types/department'

export const departmentApi = {
  getTree: () => get<Department[]>('/departments'),
  getFlat: () => get<Pick<Department, 'id' | 'name' | 'parentId'>[]>('/departments/flat'),
  getById: (id: number) => get<Department>(`/departments/${id}`),
  create: (data: CreateDepartmentDTO) => post<{ id: number }>('/departments', data),
  update: (id: number, data: Partial<CreateDepartmentDTO>) => put<null>(`/departments/${id}`, data),
  remove: (id: number) => del<null>(`/departments/${id}`),
}
