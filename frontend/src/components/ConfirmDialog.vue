<template>
  <el-popconfirm
    :title="title"
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    :confirm-button-type="confirmType"
    :icon="WarnTriangleFilled"
    icon-color="#F0A020"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  >
    <template #reference>
      <slot />
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
import { WarnTriangleFilled } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger' | 'warning'
}>(), {
  title: '确认执行此操作？',
  confirmText: '确认',
  cancelText: '取消',
  confirmType: 'danger',
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
