<template>
  <div class="status-badge" :class="tone">
    <span class="dot" />
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomStatus } from '@/types/room'
import type { OrderStatus } from '@/types/order'
import { ROOM_STATUS_CONFIG, ORDER_STATUS_CONFIG, type BadgeTone } from '@/constants'

const props = defineProps<{
  status: RoomStatus | OrderStatus
  /** 区分房态 / 订单状态，选择对应配置表 */
  variant: 'room' | 'order'
}>()

const config = computed(() =>
  props.variant === 'room'
    ? ROOM_STATUS_CONFIG[props.status as RoomStatus]
    : ORDER_STATUS_CONFIG[props.status as OrderStatus]
)
const label = computed(() => config.value?.label ?? props.status)
const tone = computed<BadgeTone>(() => config.value?.tone ?? 'info')
</script>
