<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useLeaderBoardStore } from '../stores/leaderboard'

const gameStore = useGameStore()
const leaderboardStore = useLeaderBoardStore()

const playerName = computed(() => gameStore.playerName)
const showNameDialog = ref(false)
const newPlayerName = ref('')

// Build a list of unique player names from the leaderboard
const nameSuggestions = computed(() => {
  const names = leaderboardStore.entries.map(e => e.playerName).filter(Boolean)
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
})

onMounted(() => {
  // Ensure leaderboard is loaded from localStorage
  leaderboardStore.loadFromStorage()
})

function editName() {
  newPlayerName.value = playerName.value || ''
  showNameDialog.value = true
}

function saveName() {
  if (newPlayerName.value.trim()) {
    gameStore.setPlayerName(newPlayerName.value.trim())
  }
  showNameDialog.value = false
}
</script>

<template>
  <div>
    <div @click="editName" style="cursor: pointer; display: inline-block">
      <v-icon icon="mdi-account"></v-icon> {{ playerName || 'Guest' }}
    </div>

    <v-dialog v-model="showNameDialog" persistent max-width="420">
      <v-card>
        <v-card-title>Как вас зовут?</v-card-title>
        <v-card-text>
          <v-combobox
            v-model="newPlayerName"
            :items="nameSuggestions"
            label="Player name"
            autofocus
            clearable
            hide-no-data
            @keyup.enter="saveName"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" @click="showNameDialog = false">Отмена</v-btn>
          <v-btn variant="flat" @click="saveName" :disabled="!newPlayerName.trim()">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
div[style*='cursor: pointer'] {
  padding: 4px 8px;
  border-radius: 4px;
}
div[style*='cursor: pointer']:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
