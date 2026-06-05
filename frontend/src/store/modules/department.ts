import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { Department } from '@/types/department'
import { departmentApi } from '@/api/department'

export interface DepartmentState {
  tree: Department[]
  flat: Pick<Department, 'id' | 'name' | 'parentId'>[]
  loading: boolean
}

export const departmentModule: Module<DepartmentState, RootState> = {
  namespaced: true,
  state: (): DepartmentState => ({
    tree: [],
    flat: [],
    loading: false,
  }),
  mutations: {
    SET_TREE(state, tree: Department[]) {
      state.tree = tree
    },
    SET_FLAT(state, flat: Pick<Department, 'id' | 'name' | 'parentId'>[]) {
      state.flat = flat
    },
    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },
  },
  actions: {
    async fetchTree({ commit }) {
      commit('SET_LOADING', true)
      try {
        const tree = await departmentApi.getTree()
        commit('SET_TREE', tree)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchFlat({ commit }) {
      const flat = await departmentApi.getFlat()
      commit('SET_FLAT', flat)
    },
  },
}
