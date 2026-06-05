import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { Employee } from '@/types/employee'
import type { PageQuery } from '@/types/api'
import { employeeApi } from '@/api/employee'

export interface EmployeeState {
  list: Employee[]
  total: number
  loading: boolean
  currentEmployee: Employee | null
}

export const employeeModule: Module<EmployeeState, RootState> = {
  namespaced: true,
  state: (): EmployeeState => ({
    list: [],
    total: 0,
    loading: false,
    currentEmployee: null,
  }),
  mutations: {
    SET_LIST(state, { list, total }: { list: Employee[]; total: number }) {
      state.list = list
      state.total = total
    },
    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },
    SET_CURRENT(state, employee: Employee | null) {
      state.currentEmployee = employee
    },
  },
  actions: {
    async fetchList({ commit }, params: PageQuery) {
      commit('SET_LOADING', true)
      try {
        const result = await employeeApi.getList(params)
        commit('SET_LIST', { list: result.list, total: result.total })
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchById({ commit }, id: number) {
      const employee = await employeeApi.getById(id)
      commit('SET_CURRENT', employee)
      return employee
    },
  },
}
