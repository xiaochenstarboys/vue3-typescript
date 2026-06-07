<template>
  <div class="navbar-container">
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <button class="collapse-btn" @click="$emit('toggle')">
        <el-icon :size="18">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </button>

      <!-- 面包屑 -->
      <nav class="breadcrumb">
        <el-icon class="breadcrumb-home" :size="14"><HomeFilled /></el-icon>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ currentTitle || '首页' }}</span>
      </nav>
    </div>

    <div class="navbar-right">
      <!-- 主题切换 -->
      <el-tooltip :content="isDark ? '切换亮色主题' : '切换暗色主题'" placement="bottom">
        <button class="icon-btn" @click="toggleTheme">
          <el-icon :size="18">
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </button>
      </el-tooltip>

      <!-- 通知 -->
      <button class="icon-btn">
        <el-icon :size="18"><Bell /></el-icon>
      </button>

      <!-- 用户 -->
      <el-dropdown trigger="click" @command="handleCommand" popper-class="user-dropdown">
        <div class="user-trigger">
          <el-avatar :size="34" :src="user?.avatar" class="nav-avatar">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="user-text">
            <span class="nav-username">{{ user?.username }}</span>
            <span class="nav-role">管理员</span>
          </div>
          <el-icon class="nav-chevron" :size="12"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="dropdown-header">
              <span class="dropdown-name">{{ user?.username }}</span>
              <span class="dropdown-email">admin@hr.com</span>
            </div>
            <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, SwitchButton, Bell } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useStore } from '@/store'
import { useTheme } from '@/composables/useTheme'

defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

const store = useStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const user = computed(() => store.state.auth.user)
const currentTitle = computed(() => route.meta.title as string | undefined)

async function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    await store.dispatch('auth/logout')
    router.push('/login')
  }
}
</script>

<style lang="less" scoped>
.navbar-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 @space-xl;
}

// 左侧
.navbar-left {
  display: flex;
  align-items: center;
  gap: @space-md;
}

.collapse-btn {
  width: 34px;
  height: 34px;
  border: 1px solid @border-color;
  border-radius: @border-radius;
  background: transparent;
  color: @text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: @primary;
    border-color: rgba(var(--primary-rgb), 0.3);
    background: rgba(var(--primary-rgb), 0.05);
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: @space-xs;
  font-size: @font-size-sm;

  .breadcrumb-home {
    color: @text-placeholder;
  }

  .breadcrumb-sep {
    color: @border-color;
    font-weight: @font-weight-normal;
  }

  .breadcrumb-current {
    color: @text-primary;
    font-weight: @font-weight-medium;
  }
}

// 右侧
.navbar-right {
  display: flex;
  align-items: center;
  gap: @space-xs;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: @border-radius;
  background: transparent;
  color: @text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: @text-primary;
    background: var(--el-fill-color-light);
  }
}

// 用户触发区
.user-trigger {
  display: flex;
  align-items: center;
  gap: @space-sm;
  cursor: pointer;
  padding: @space-xs @space-sm;
  border-radius: @border-radius;
  transition: all 0.15s ease;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.nav-avatar {
  flex-shrink: 0;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 0;

  .nav-username {
    font-size: @font-size-sm;
    font-weight: @font-weight-semibold;
    color: @text-primary;
    line-height: 1.2;
  }

  .nav-role {
    font-size: 11px;
    color: @text-secondary;
    line-height: 1.2;
  }
}

.nav-chevron {
  color: @text-placeholder;
  transition: transform 0.15s ease;

  .user-trigger:hover & {
    transform: translateY(2px);
  }
}

// 下拉菜单头部
:deep(.dropdown-header) {
  padding: @space-sm @space-md 6px;
  display: flex;
  flex-direction: column;

  .dropdown-name {
    font-size: @font-size-sm;
    font-weight: @font-weight-semibold;
    color: @text-primary;
  }

  .dropdown-email {
    font-size: @font-size-xs;
    color: @text-secondary;
  }
}
</style>
