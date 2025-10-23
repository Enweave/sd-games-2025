<template>
  <header class="header">
    <h2 class="title">{{ GAMETYPE.DINO }}</h2>
    <div class="spacer"></div>
    <h3 class="wobble">...ещё катится, а вы - не сдавайтесь, стройтесь</h3>
  </header>
</template>

<script setup lang="ts">
import { GAMETYPE } from '../types/game'
</script>

<style scoped lang="sass">
@use "../styles/settings" as s


@keyframes wobble
  0%, 100%
    transform: rotate(-1deg)
  50%
    transform: rotate(1deg)

.wobble
  display: inline-block
  color: s.$color-orange
  animation: wobble 1s infinite ease-in-out
</style>
