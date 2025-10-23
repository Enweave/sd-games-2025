// File: `src/stores/game.ts`
import { defineStore } from 'pinia'
import { GameState, GAMETYPE, GAMESTATUS } from '../types/game'

const STORAGE_KEY = 'game-store'

function loadState(): GameState | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GameState) : null
  } catch {
    return null
  }
}

export const useGameStore = defineStore('game', {
  state: () =>
    (loadState() ?? {
      currentGame: null,
      gameStatus: GAMESTATUS.NOT_STARTED,
      playerName: null,
      secondaryPlayerName: null,
    }) as GameState,
  actions: {
    persist() {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch (error) {
        console.error('Failed to persist game state:', error)
      }
    },
    setPlayerName(name: string) {
      this.playerName = name
      this.persist()
    },
    setSecondaryPlayerName(name: string) {
      this.secondaryPlayerName = name
      this.persist()
    },
    startGame(gameType: GAMETYPE) {
      this.currentGame = gameType
      this.gameStatus = GAMESTATUS.IN_PROGRESS
      this.persist()
    },
    finishGame() {
      this.gameStatus = GAMESTATUS.COMPLETED
      this.persist()
    },
    loadFromStorage() {
      const saved = loadState()
      if (saved) {
        Object.assign(this, saved)
      }
    },
    clearStorage() {
      try {
        if (typeof window === 'undefined') return
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
      this.currentGame = null
      this.gameStatus = GAMESTATUS.NOT_STARTED
      this.playerName = null
      this.secondaryPlayerName = null
    },
  },
})
