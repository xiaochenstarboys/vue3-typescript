<template>
  <div class="sidebar-container" :class="{ collapsed }">
    <!-- Logo -->
    <div class="logo-area">
      <div class="logo-mark">
        <el-icon :size="20"><OfficeBuilding /></el-icon>
      </div>
      <transition name="fade">
        <div v-if="!collapsed" class="logo-text">
          <span class="logo-title">HR 管理系统</span>
          <span class="logo-sub">人力管理平台</span>
        </div>
      </transition>
    </div>

    <!-- 导航菜单 -->
    <div class="nav-section">
      <transition name="fade">
        <p v-if="!collapsed" class="nav-label">主菜单</p>
      </transition>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="transparent"
        :text-color="isLight ? '#78767A' : '#9CA3AF'"
        active-text-color="var(--primary)"
        :router="true"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            <span class="menu-title">{{ item.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 底部用户区 -->
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar-ring">
          <el-avatar :size="36" :src="user?.avatar" class="footer-avatar">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="online-dot" />
        </div>
        <transition name="fade">
          <div v-if="!collapsed" class="user-meta">
            <span class="user-name">{{ user?.username }}</span>
            <span class="user-role">管理员</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import { useTheme } from '@/composables/useTheme'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const store = useStore()
const { isDark } = useTheme()

const isLight = computed(() => !isDark.value)
const user = computed(() => store.state.auth.user)
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
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

// Logo
.logo-area {
  display: flex;
  align-items: center;
  gap: @space-sm;
  padding: 0 @space-md;
  height: @navbar-height;
  border-bottom: 1px solid var(--border-light);
  overflow: hidden;
  white-space: nowrap;
}

.logo-mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, @primary, @accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.35);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 18px rgba(var(--primary-rgb), 0.5);
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.logo-title {
  font-size: @font-size-base;
  font-weight: @font-weight-bold;
  color: @text-white;
  line-height: 1.2;
}

.logo-sub {
  font-size: 11px;
  color: @text-placeholder;
  font-weight: @font-weight-normal;
}

// 导航
.nav-section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: @space-sm 0;
}

.nav-label {
  font-size: 10px;
  font-weight: @font-weight-bold;
  color: @text-placeholder;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: @space-sm @space-xl @space-xs;
  margin: 0;
  user-select: none;
}

.el-menu {
  border-right: none !important;
  background: transparent !important;

  :deep(.el-menu-item) {
    margin: 2px 10px !important;
    border-radius: @border-radius !important;
    height: 42px !important;
    line-height: 42px !important;
    font-size: @font-size-sm;
    transition: all 0.15s ease !important;

    &:hover {
      background: var(--bg-sidebar-hover) !important;
    }

    &.is-active {
      background: rgba(var(--primary-rgb), 0.15) !important;
      color: var(--primary) !important;
      font-weight: @font-weight-semibold;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        border-radius: 0 3px 3px 0;
        background: var(--primary);
      }
    }
  }
}

.menu-title {
  margin-left: 4px;
}

// 底部用户卡
.sidebar-footer {
  padding: @space-sm @space-md @space-md;
  border-top: 1px solid var(--border-light);
}

.user-card {
  display: flex;
  align-items: center;
  gap: @space-sm;
  padding: @space-sm;
  border-radius: @border-radius;
  transition: background 0.15s ease;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    background: var(--bg-sidebar-hover);
  }
}

.user-avatar-ring {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: @success;
  border: 2px solid @bg-sidebar;
}

.footer-avatar {
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.user-name {
  font-size: @font-size-sm;
  font-weight: @font-weight-medium;
  color: @text-regular;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: @text-placeholder;
  line-height: 1.2;
}

// 折叠态
.sidebar-container.collapsed {
  .logo-area {
    justify-content: center;
    padding: 0;
  }

  .sidebar-footer {
    padding: @space-sm;
  }

  .user-card {
    justify-content: center;
    padding: @space-xs;
  }
}

// 过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
