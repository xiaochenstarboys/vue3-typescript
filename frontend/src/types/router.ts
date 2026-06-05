import type { RouteMeta } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    permission?: string
    hidden?: boolean
    breadcrumb?: boolean
  }
}

export type { RouteMeta }
