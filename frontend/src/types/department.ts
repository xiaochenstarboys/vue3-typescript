export interface Department {
  id: number
  name: string
  leaderId?: number
  leaderName?: string
  parentId?: number | null
  children?: Department[]
  employeeCount?: number
  createdAt: string
}

export type CreateDepartmentDTO = Omit<Department, 'id' | 'createdAt' | 'leaderName' | 'children' | 'employeeCount'>
export type UpdateDepartmentDTO = Partial<CreateDepartmentDTO> & { id: number }
