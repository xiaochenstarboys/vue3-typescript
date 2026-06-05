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

  &.collapsed {
    width: @sidebar-collapsed-width;
  }
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
  box-shadow: @shadow-sm;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: @space-lg;
}
</style>
