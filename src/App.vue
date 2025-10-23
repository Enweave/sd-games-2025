<template>
  <v-app>
    <div class="app-bar">
      <v-container>
        <div class="d-flex align-center justify-space-between">
          <!-- Home icon as link -->
          <v-btn icon :to="{ path: '/' }" variant="text" class="mr-2" :exact="true">
            <v-icon icon="mdi-home" />
          </v-btn>

          <!-- Desktop links -->
          <v-toolbar-items class="hidden-sm-and-down">
            <v-btn
              v-for="link in links"
              :key="link.to"
              :to="{ path: link.to }"
              variant="text"
              density="comfortable"
              class="mx-1"
              :exact="link.to === '/'"
            >
              {{ link.label }}
            </v-btn>
          </v-toolbar-items>

          <!-- Mobile burger -->
          <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = true" />
        </div>
      </v-container>
    </div>

    <!-- Mobile drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      :scrim="true"
      class="hidden-md-and-up"
    >
      <v-list nav density="compact">
        <v-list-item :to="{ path: '/' }" :exact="true" @click="drawer = false">
          <template #prepend>
            <v-icon icon="mdi-home" />
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="link in links"
          :key="link.to"
          :to="{ path: link.to }"
          :exact="link.to === '/'"
          @click="drawer = false"
        >
          <v-list-item-title>{{ link.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)

// Navigation links (excluding Home which is the icon)
const links = [
  { to: '/tic', label: 'TicTacToe' },
  { to: '/dino', label: 'DinoRun' },
  { to: '/quiz', label: 'QuizGame' },
  { to: '/motion', label: 'MotionGame' },
]
</script>

<style scoped lang="sass">
@use "styles/settings" as s
@use "sass:math"


/* Highlight active route buttons (desktop) */
:deep(.v-btn.router-link-active), :deep(.v-btn.router-link-exact-active)
  color: var(--v-theme-primary)
  font-weight: 700

/* Highlight active list items (mobile) */
:deep(.v-list-item--active)
  color: var(--v-theme-primary)
  font-weight: 700

.app-bar
  padding-bottom: math.div(s.$grid-gutter, 2)
  padding-top: math.div(s.$grid-gutter, 2)
  border-bottom: 1px solid s.$color-orange
</style>
