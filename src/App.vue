<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <NavBar />

  <main id="app">
    <div id="center">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    
    <div id="spacer">
      <div class="ticks"></div>
    </div>
  </main>
</template>

<style>
/* Transition for smooth page switching */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure the main container respects your institutional CSS constraints */
main#app {
  border-inline: 1px solid var(--border);
  margin: 0 auto;
}
</style>