<template>
  <div class="default-layout">
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <SidebarComp :collapsed="isCollapsed" />
    </aside>
    <div class="main-wrapper">
      <header class="navbar">
        <NavbarComp :collapsed="isCollapsed" @toggle="isCollapsed = !isCollapsed" />
      </header>
      <main class="content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in" appear>
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarComp from './components/Sidebar.vue'
import NavbarComp from './components/Navbar.vue'
const isCollapsed = ref(false)
</script>

<style lang="less" scoped>
.default-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: @bg-page;
}

.sidebar {
  width: @sidebar-width;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--border-light);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
  &.collapsed { width: @sidebar-collapsed-width; }
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: @navbar-height;
  flex-shrink: 0;
  background: @bg-card;
  border-bottom: 1px solid @border-color;
  z-index: 10;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: @space-lg @space-xl;
}
</style>
