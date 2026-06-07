<template>
  <el-avatar :size="size" :src="avatar" :style="avatarStyle" class="user-avatar">
    {{ initials }}
  </el-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  avatar?: string
  size?: number
}>()

const initials = computed(() => props.name?.charAt(0).toUpperCase() ?? '?')

const avatarStyle = computed(() => {
  if (props.avatar) return {}
  return { background: 'var(--primary)', color: '#fff', fontSize: `${(props.size ?? 36) * 0.4}px`, fontWeight: 600 }
})
</script>

<style lang="less" scoped>
.user-avatar {
  flex-shrink: 0;
  box-shadow: var(--avatar-shadow);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 3px 12px rgba(var(--primary-rgb), 0.18);
  }
}
</style>
