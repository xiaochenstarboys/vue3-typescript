import { createStore, useStore as baseUseStore, Store } from 'vuex'
import type { InjectionKey } from 'vue'
import { authModule, type AuthState } from './modules/auth'
import { employeeModule, type EmployeeState } from './modules/employee'
import { departmentModule, type DepartmentState } from './modules/department'

export interface RootState {
  auth: AuthState
  employee: EmployeeState
  department: DepartmentState
}

export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  modules: {
    auth: authModule,
    employee: employeeModule,
    department: departmentModule,
  },
})

export function useStore() {
  return baseUseStore(key)
}
