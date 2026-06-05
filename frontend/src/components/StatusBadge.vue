<template>
  <div class="status-badge" :class="status">
    <span class="dot" />
    {{ labelMap[status] }}
  </div>
</template>

<script setup lang="ts">
import type { EmployeeStatus } from '@/types/employee'

defineProps<{ status: EmployeeStatus }>()

const labelMap: Record<EmployeeStatus, string> = {
  active: '在职',
  probation: '试用期',
  inactive: '离职',
}
</script>
