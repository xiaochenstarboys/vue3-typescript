import type { Module } from 'vuex'
import type { RootState } from '../index'
import { authApi, type LoginDTO, type LoginResult } from '@/api/auth'

export interface AuthState {
  token: string | null
  user: LoginResult['user'] | null
}

export const authModule: Module<AuthState, RootState> = {
  namespaced: true,
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
  },
  mutations: {
    SET_TOKEN(state, token: string) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user: LoginResult['user']) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    CLEAR(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
  actions: {
    async login({ commit }, payload: LoginDTO) {
      const result = await authApi.login(payload)
      commit('SET_TOKEN', result.token)
      commit('SET_USER', result.user)
      return result
    },
    async logout({ commit }) {
      await authApi.logout()
      commit('CLEAR')
    },
  },
}
