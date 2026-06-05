<template>
  <div class="navbar-container">
    <div class="left">
      <el-button text @click="$emit('toggle')">
        <el-icon :size="20"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
      </el-button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right">
      <el-tooltip :content="isDark ? '切换亮色' : '切换暗色'" placement="bottom">
        <el-button text @click="toggleTheme">
          <el-icon :size="18"><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="user?.avatar">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ user?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SwitchButton } from '@element-plus/icons-vue'
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
  padding: 0 @space-lg;

  .left {
    display: flex;
    align-items: center;
    gap: @space-md;
  }

  .right {
    display: flex;
    align-items: center;
    gap: @space-sm;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: @space-sm;
    cursor: pointer;
    padding: @space-xs @space-sm;
    border-radius: @border-radius;
    transition: @transition-base;

    &:hover { background: @bg-page; }

    .username {
      font-size: @font-size-sm;
      color: @text-primary;
      font-weight: 500;
    }
  }
}
</style>
