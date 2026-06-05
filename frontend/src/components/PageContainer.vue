<template>
  <div class="page-container">
    <div class="page-header" v-if="title || $slots.action">
      <div class="header-left">
        <h2 class="page-title" v-if="title">{{ title }}</h2>
        <p class="page-desc" v-if="desc">{{ desc }}</p>
      </div>
      <div class="header-right" v-if="$slots.action">
        <slot name="action" />
      </div>
    </div>
    <div class="page-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  desc?: string
}>()
</script>

<style lang="less" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: @space-md;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-md;

  .header-left {
    .page-title {
      font-size: @font-size-lg;
      font-weight: 700;
      color: @text-primary;
      line-height: 1.3;
    }

    .page-desc {
      font-size: @font-size-sm;
      color: @text-secondary;
      margin-top: @space-xs;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: @space-sm;
    flex-shrink: 0;
  }
}

.page-body {
  flex: 1;
}
</style>
