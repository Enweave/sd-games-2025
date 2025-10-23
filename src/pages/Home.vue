<script setup lang="ts">
import { useLeaderBoardStore } from '../stores/leaderboard'
import { onMounted, computed, ref } from 'vue'
import { GAMETYPE, GameResult } from '../types/game'

// Store and state
const leaderboardStore = useLeaderBoardStore()
const selectedGameType = ref<GAMETYPE | 'ALL'>('ALL')

// Load data on mount
onMounted(() => {
  leaderboardStore.loadFromStorage()
})

// Table headers
const headers = [
  { title: 'Player', key: 'playerName', align: 'start' },
  { title: 'Games Played', key: 'gamesPlayed', align: 'end' },
  { title: 'Wins', key: 'wins', align: 'end' },
  { title: 'Losses', key: 'losses', align: 'end' },
]

// Game type options for the filter
const gameTypeOptions = ['ALL', ...Object.values(GAMETYPE)]

// Computed property to aggregate and filter leaderboard data
const aggregatedData = computed(() => {
  // Filter entries based on the selected game type
  const filteredEntries = leaderboardStore.entries.filter(
    (entry) => selectedGameType.value === 'ALL' || entry.gameType === selectedGameType.value,
  )

  // Aggregate data by player
  const playerStats: Record<
    string,
    { playerName: string; gamesPlayed: number; wins: number; losses: number }
  > = {}

  for (const entry of filteredEntries) {
    if (!playerStats[entry.playerName]) {
      playerStats[entry.playerName] = {
        playerName: entry.playerName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
      }
    }
    const stats = playerStats[entry.playerName]
    stats.gamesPlayed++
    if (entry.gameResult === GameResult.WIN) {
      stats.wins++
    } else if (entry.gameResult === GameResult.LOSS) {
      stats.losses++
    }
  }

  return Object.values(playerStats)
})
</script>

<template>
  <h1>Leaderboard</h1>

  <v-select
    v-model="selectedGameType"
    :items="gameTypeOptions"
    label="Filter by Game Type"
    density="compact"
    class="mb-4"
    style="max-width: 300px"
  ></v-select>

  <v-data-table
    :headers="headers"
    :items="aggregatedData"
    item-key="playerName"
    class="elevation-1"
  >
  </v-data-table>
</template>

<style scoped></style>
