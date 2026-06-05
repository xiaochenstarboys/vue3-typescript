import { get, post, put, del } from '@/utils/request'
import type { Employee, CreateEmployeeDTO } from '@/types/employee'
import type { PageResult, PageQuery } from '@/types/api'

export const employeeApi = {
  getList: (params: PageQuery) => get<PageResult<Employee>>('/employees', params),
  getById: (id: number) => get<Employee>(`/employees/${id}`),
  create: (data: CreateEmployeeDTO) => post<{ id: number }>('/employees', data),
  update: (id: number, data: Partial<CreateEmployeeDTO>) => put<null>(`/employees/${id}`, data),
  remove: (id: number) => del<null>(`/employees/${id}`),
  batchRemove: (ids: number[]) => del<null>('/employees', { ids }),
}
