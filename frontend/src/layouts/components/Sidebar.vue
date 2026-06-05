<template>
  <div class="sidebar-container" :class="{ collapsed }">
    <div class="logo">
      <el-icon class="logo-icon"><OfficeBuilding /></el-icon>
      <span v-if="!collapsed" class="logo-text">HR 管理系统</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#1C2333"
      text-color="#A0AEC0"
      active-text-color="#FFFFFF"
      :router="true"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const activeMenu = computed(() => '/' + route.path.split('/')[1])

const menuItems = [
  { path: '/dashboard', title: '首页概览', icon: 'Odometer' },
  { path: '/employee', title: '员工管理', icon: 'User' },
  { path: '/department', title: '部门管理', icon: 'OfficeBuilding' },
]
</script>

<style lang="less" scoped>
.sidebar-container {
  height: 100%;
  background: @bg-sidebar;
  display: flex;
  flex-direction: column;
  transition: background 0.4s ease;

  .logo {
    height: @navbar-height;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: @space-sm;
    padding: 0 @space-md;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
    white-space: nowrap;

    .logo-icon {
      font-size: 22px;
      color: @primary-light;
      flex-shrink: 0;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      &:hover { transform: rotate(-10deg) scale(1.1); }
    }

    .logo-text {
      font-size: @font-size-md;
      font-weight: 600;
      color: @text-white;
      letter-spacing: 0.5px;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
  }

  .el-menu {
    border-right: none;
    flex: 1;
    padding: @space-sm 0;

    :deep(.el-menu-item) {
      margin: 2px @space-sm;
      border-radius: @border-radius;
      height: 44px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: @bg-sidebar-hover !important;
        color: @text-white !important;
      }

      &.is-active {
        background: @primary !important;
        color: @text-white !important;
      }
    }
  }

  &.collapsed .el-menu {
    :deep(.el-menu-item) {
      margin: 2px 4px;
      padding: 0 !important;
      justify-content: center;
    }
  }
}
</style>
