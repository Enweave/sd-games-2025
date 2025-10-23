<template>
  <div>
    <h2 class="mb-2">{{ GAMETYPE.TIC }}</h2>

    <v-row class="mb-4" align="start" no-gutters>
      <v-col cols="12" sm="6">
        <v-select
          :model-value="mode"
          @update:model-value="onModeAttemptChange"
          :items="modeOptions"
          label="Режим"
          density="compact"
        />
      </v-col>

      <v-col cols="12" sm="6" class="d-flex justify-center justify-sm-end">
        <v-btn class="ml-3" variant="flat" @click="onStart" :disabled="gameInProgress"
          >Начать</v-btn
        >
        <v-btn class="ml-2" variant="tonal" @click="resetGame">Сброс</v-btn>
      </v-col>
    </v-row>

    <div v-if="gameInProgress" class="mt-6 text-center">
      <div class="player-names">
        <span class="player text-amber-accent-1">{{ player1Name || 'Player 1' }} (X)</span>
        <span class="mx-2">против</span>
        <span class="player text-amber-accent-1"
          >{{ player2Name || (mode === 'AI' ? 'AI' : 'Player 2') }} (O)</span
        >
      </div>
    </div>

    <!-- Board -->
    <div class="d-flex justify-center mt-12">
      <div class="board">
        <div
          v-for="(cell, idx) in board"
          :key="idx"
          class="cell"
          :class="{ clickable: canPlay(idx), win: winningLine.includes(idx) }"
          @click="handleCellClick(idx)"
        >
          {{ cell }}
        </div>
      </div>
    </div>

    <div class="mt-6 text-center">
      <div v-if="!gameInProgress && !hasBoardActivity">Нажмите "Начать"</div>
      <div v-else>
        <span v-if="winner">
          <template v-if="winner === 'Draw'">Ничья!</template>
          <template v-else>{{ winner }} побеждает!</template>
        </span>
        <span v-else>Ходит {{ currentPlayerName }} ({{ currentSymbol }})</span>
      </div>
    </div>
    <!-- Name dialog -->
    <v-dialog v-model="showNameDialog" max-width="420">
      <v-card>
        <v-card-title>Введите имя<span v-if="mode === 'PvP'"></span></v-card-title>
        <v-card-text>
          <v-text-field v-model="name1" label="Игрок 1" autofocus />
          <v-text-field v-if="mode === 'PvP'" v-model="name2" label="Игрок 2" />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="outlined" @click="cancelNames">Отмена</v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            @click="confirmNames"
            :disabled="!name1 || (mode === 'PvP' && !name2)"
          >
            Продолжить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Result dialog -->
    <v-dialog v-model="showResultDialog" max-width="420">
      <v-card>
        <v-card-title>Игра окончена!</v-card-title>
        <v-card-text>
          <div class="text-subtitle-1" v-if="winner === 'Draw'">Ничья!</div>
          <div class="text-subtitle-1" v-else>{{ winner }} побеждает!</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showResultDialog = false">Закрыть</v-btn>
          <v-btn variant="flat" @click="onPlayAgain">Играть снова</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mode change confirmation dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="420">
      <v-card>
        <v-card-title>Сменить режим?</v-card-title>
        <v-card-text>Игра идет. Изменить режим и сбросить текущую игру?</v-card-text>
        <v-card-actions>
          <v-btn variant="outlined" @click="onCancelModeChange">Нет</v-btn>
          <v-spacer />
          <v-btn variant="flat" @click="onConfirmModeChange">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { useLeaderBoardStore } from '../stores/leaderboard'
import { GAMETYPE, GameResult, GAMESTATUS } from '../types/game'

// Stores
const gameStore = useGameStore()
const leaderboardStore = useLeaderBoardStore()

// Local state
const modeOptions = ['PvP', 'AI'] as const
const mode = ref<(typeof modeOptions)[number]>('PvP')
const board = ref<('' | 'X' | 'O')[]>(Array(9).fill(''))
const xTurn = ref(true)
const winner = ref<string | null>(null) // "Draw" or name
const winningLine = ref<number[]>([])
const showNameDialog = ref(false)
const showResultDialog = ref(false)
const name1 = ref('')
const name2 = ref('')

// Mode change confirmation state
const showConfirmDialog = ref(false)
const pendingMode = ref<(typeof modeOptions)[number] | null>(null)

const hasBoardActivity = computed(() => board.value.some((c) => c !== ''))
const gameInProgress = computed(() => gameStore.gameStatus === GAMESTATUS.IN_PROGRESS)

const currentSymbol = computed(() => (xTurn.value ? 'X' : 'O'))
const player1Name = computed(() => gameStore.playerName || '')
const player2Name = computed(() =>
  mode.value === 'AI' ? 'AI' : gameStore.secondaryPlayerName || '',
)
const currentPlayerName = computed(() => (xTurn.value ? player1Name.value : player2Name.value))

function canPlay(idx: number) {
  return !winner.value && board.value[idx] === '' && gameInProgress.value
}

function onStart() {
  // Ensure names
  if (!gameStore.playerName || (mode.value === 'PvP' && !gameStore.secondaryPlayerName)) {
    name1.value = gameStore.playerName || ''
    name2.value = gameStore.secondaryPlayerName || ''
    showNameDialog.value = true
    return
  }
  start()
}

function confirmNames() {
  if (!name1.value) return
  gameStore.setPlayerName(name1.value.trim())
  if (mode.value === 'PvP') {
    if (!name2.value) return
    gameStore.setSecondaryPlayerName(name2.value.trim())
  } else {
    gameStore.setSecondaryPlayerName('AI')
  }
  showNameDialog.value = false
  start()
}

function cancelNames() {
  // Just close the dialog and keep current names unchanged
  showNameDialog.value = false
  // Optionally clear inputs so next open doesn't auto-fill stale values
  name1.value = gameStore.playerName || ''
  name2.value = mode.value === 'PvP' ? gameStore.secondaryPlayerName || '' : ''
}

function start() {
  resetBoardOnly()
  winner.value = null
  winningLine.value = []
  xTurn.value = true
  showResultDialog.value = false
  gameStore.startGame(GAMETYPE.TIC)
}

function resetBoardOnly() {
  board.value = Array(9).fill('')
}

function resetGame() {
  resetBoardOnly()
  winner.value = null
  winningLine.value = []
  xTurn.value = true
  showResultDialog.value = false
  // Ensure the store reflects that no game is currently in progress
  gameStore.currentGame = null
  gameStore.gameStatus = GAMESTATUS.NOT_STARTED
  if (typeof gameStore.persist === 'function') gameStore.persist()
}

function handleCellClick(idx: number) {
  if (!canPlay(idx)) return
  board.value[idx] = currentSymbol.value
  checkGameStateAndProceed()
}

function checkGameStateAndProceed() {
  const res = calculateWinner(board.value)
  if (res) {
    winningLine.value = res.line
    finish(res.symbol)
    return
  }
  if (board.value.every((c) => c !== '')) {
    finish(null) // draw
    return
  }
  // Swap turn
  xTurn.value = !xTurn.value

  // AI move if needed
  if (!winner.value && mode.value === 'AI' && !xTurn.value) {
    aiMove()
  }
}

function aiMove() {
  // Simple AI: pick first empty, or random among empties
  const empties = board.value.map((v, i) => (v === '' ? i : -1)).filter((i) => i !== -1) as number[]
  if (empties.length === 0) return
  const choice = empties[Math.floor(Math.random() * empties.length)]
  board.value[choice] = 'O'
  checkGameStateAndProceed()
}

function onConfirmModeChange() {
  showConfirmDialog.value = false
  if (!pendingMode.value) return
  const target = pendingMode.value
  pendingMode.value = null
  // Reset current game, then apply new mode and its side effects
  resetGame()
  mode.value = target
  applyModeSideEffects(target)
}

function onCancelModeChange() {
  showConfirmDialog.value = false
  pendingMode.value = null
}

function finish(symbol: 'X' | 'O' | null) {
  const p1 = player1Name.value || 'Player 1'
  const p2 = player2Name.value || (mode.value === 'AI' ? 'AI' : 'Player 2')

  if (symbol === 'X') {
    winner.value = p1
    recordResult(p1, GameResult.WIN)
    recordResult(p2, GameResult.LOSS)
  } else if (symbol === 'O') {
    winner.value = p2
    recordResult(p2, GameResult.WIN)
    recordResult(p1, GameResult.LOSS)
  } else {
    winner.value = 'Draw'
    recordResult(p1, GameResult.DRAW)
    recordResult(p2, GameResult.DRAW)
  }
  gameStore.finishGame()
  showResultDialog.value = true
}

function recordResult(playerName: string, result: GameResult) {
  leaderboardStore.addEntry({
    playerName,
    score: result === GameResult.WIN ? 1 : 0,
    gameResult: result,
    losses: result === GameResult.LOSS ? 1 : 0,
    runs: 1,
    gameType: GAMETYPE.TIC,
    date: new Date().toISOString(),
  })
}

function onPlayAgain() {
  showResultDialog.value = false
  start()
}

function calculateWinner(b: ('' | 'X' | 'O')[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const
  for (const [a, b1, c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { symbol: b[a], line: [a, b1, c] }
    }
  }
  return null
}

function applyModeSideEffects(val: (typeof modeOptions)[number]) {
  if (val === 'AI') {
    // Ensure secondary name is AI in this mode
    gameStore.setSecondaryPlayerName('AI')
    // If main player name is missing, ask for it
    if (!gameStore.playerName) {
      name1.value = ''
      name2.value = ''
      showNameDialog.value = true
    }
  } else if (val === 'PvP') {
    // If switching to PvP, ask for second player's name if it's missing or still 'AI'
    const needSecond =
      !gameStore.secondaryPlayerName ||
      gameStore.secondaryPlayerName.trim() === '' ||
      gameStore.secondaryPlayerName === 'AI'
    if (!gameStore.playerName || needSecond) {
      name1.value = gameStore.playerName || ''
      name2.value = needSecond ? '' : gameStore.secondaryPlayerName || ''
      showNameDialog.value = true
    }
  }
}

// Handle mode selection attempts via the select's update event instead of watcher to avoid double-click issues
function onModeAttemptChange(val: (typeof modeOptions)[number]) {
  // If a game is in progress, ask for confirmation and keep current mode until user confirms
  if (gameInProgress.value) {
    pendingMode.value = val
    showConfirmDialog.value = true
    return
  }
  // No game in progress: apply immediately
  mode.value = val
  applyModeSideEffects(val)
}
</script>

<style scoped lang="sass">
@use "../styles/settings" as s

.board
  width: 300px
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 6px

.cell
  width: 96px
  height: 96px
  border: 1px solid s.$color-white
  display: flex
  align-items: center
  justify-content: center
  font-size: 42px
  font-weight: 700
  user-select: none

.cell.clickable
  cursor: pointer

.cell.win
  background: rgba(76, 175, 80, 0.2)
</style>
