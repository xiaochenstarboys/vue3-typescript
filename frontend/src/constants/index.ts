import type { EmployeeStatus } from '@/types/employee'

export const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
] as const

export type GenderValue = typeof GENDER_OPTIONS[number]['value']

export const STATUS_OPTIONS: { label: string; value: EmployeeStatus }[] = [
  { label: '在职', value: 'active' },
  { label: '试用期', value: 'probation' },
  { label: '离职', value: 'inactive' },
]

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: '在职',
  probation: '试用期',
  inactive: '离职',
}

export const PAGE_SIZES = [10, 20, 50, 100]
