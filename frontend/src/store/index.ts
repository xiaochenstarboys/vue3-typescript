import { createStore, useStore as baseUseStore, type Store } from 'vuex'
import type { InjectionKey } from 'vue'
import { authModule, type AuthState } from './modules/auth'

export interface RootState {
  auth: AuthState
}

export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  modules: {
    auth: authModule,
  },
})

export function useStore(): Store<RootState> {
  return baseUseStore(key)
}
