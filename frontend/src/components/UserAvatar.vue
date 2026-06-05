<template>
  <el-avatar :size="size" :src="avatar" :style="avatarStyle">
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

const colors = ['#4F6AF5', '#18A058', '#F0A020', '#D03050', '#7B94FF', '#409EFF']

const initials = computed(() => props.name?.charAt(0).toUpperCase() ?? '?')

const avatarStyle = computed(() => {
  if (props.avatar) return {}
  const index = (props.name?.charCodeAt(0) ?? 0) % colors.length
  return { background: colors[index], color: '#fff', fontSize: `${(props.size ?? 36) * 0.4}px` }
})
</script>
