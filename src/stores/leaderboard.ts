import { defineStore } from 'pinia'
import { Leaderboard, ScoreEntry } from '../types/game'

const STORAGE_KEY = 'leaderboard-store'

function loadLeaderboard(): Leaderboard | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Leaderboard) : null
  } catch {
    return null
  }
}

export const useLeaderBoardStore = defineStore('leaderboard', {
  state: () =>
    ({
      entries: [],
    }) as Leaderboard,
  actions: {
    persist() {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch (error) {
        console.error('Failed to persist leaderboard state:', error)
      }
    },
    loadFromStorage() {
      const saved = loadLeaderboard()
      if (saved) {
        Object.assign(this, saved)
      }
    },
    addEntry(entry: ScoreEntry) {
      this.entries.push(entry)
      this.persist()
    },
    clearEntries() {
      this.entries = []
      this.persist()
    },
  },
})
