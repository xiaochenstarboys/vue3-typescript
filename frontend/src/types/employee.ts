export type EmployeeStatus = 'active' | 'inactive' | 'probation'

export interface Employee {
  id: number
  name: string
  gender: 'male' | 'female'
  departmentId: number
  departmentName?: string
  position: string
  salary: number
  entryDate: string
  status: EmployeeStatus
  avatar?: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

export type CreateEmployeeDTO = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'departmentName'>
export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO> & { id: number }
