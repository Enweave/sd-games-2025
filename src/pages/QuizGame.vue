<template>
  <v-container class="quiz" fluid>
    <v-toolbar density="compact" class="mb-4" color="transparent" flat>
      <v-toolbar-title class="title">{{ GAMETYPE.QUIZ }}</v-toolbar-title>
      <v-spacer />
      <div v-if="quizGroup && !isFinished" class="progress">Вопрос {{ currentNumber }} / {{ totalQuestions }}</div>
    </v-toolbar>

    <section v-if="!started" class="start">
      <v-row class="align-center">
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="selectedTopic"
            :items="topicItems"
            item-value="value"
            item-title="title"
            label="Выберите тему"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-btn variant="flat" :disabled="!selectedTopic" @click="onStart" block>Начать</v-btn>
        </v-col>
      </v-row>
    </section>

    <section v-else class="game">
      <v-card v-if="quizGroup" class="pa-4" variant="tonal">
        <div class="group mb-2">Тема: {{ quizGroup.groupName }}</div>
        <div class="question mb-3">{{ currentQuestion?.question }}</div>

        <v-list density="comfortable" lines="one">
          <v-list-item
            v-for="(opt, idx) in currentQuestion?.options || []"
            :key="idx"
            @click="choose(idx)"
            :active="lastChosenIndex === idx"
            :value="idx"
            rounded
          >
            <template #prepend>
              <v-icon
                :icon="
                  lastChosenIndex === idx
                    ? 'mdi-checkbox-marked-circle-outline'
                    : 'mdi-checkbox-blank-circle-outline'
                "
              />
            </template>
            <v-list-item-title>{{ opt }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <div class="footer mt-4">
          <div class="mb-4">Правильных ответов: {{ correctCount }}</div>
          <v-btn v-if="isFinished" variant="flat" @click="restart">Сыграть ещё раз</v-btn>
        </div>
      </v-card>
    </section>

    <!-- Result dialog -->
    <v-dialog v-model="showResult" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Результат</v-card-title>
        <v-card-text>
          <div class="mb-2">Вы ответили правильно: {{ correctCount }} из {{ totalQuestions }}</div>
          <div v-if="lastResult === GameResult.WIN">Поздравляем! Победа 🎉</div>
          <div v-else>Удачи в следующий раз!</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResult = false">Закрыть</v-btn>
          <v-btn variant="flat" @click="((showResult = false), restart())">Сыграть ещё</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import frontend from '../quiz/frontend.json'
import backend from '../quiz/backend.json'
import { useGameStore } from '../stores/game'
import { useLeaderBoardStore } from '../stores/leaderboard'
import { GAMETYPE, GameResult, QuizGroup, QuizQuestion } from '../types/game'

const QUESTIONS_PER_QUIZ = 5

const game = useGameStore()
const leaderboard = useLeaderBoardStore()

const topicItems = [
  { title: 'Frontend', value: 'frontend' },
  { title: 'Backend', value: 'backend' },
]

const selectedTopic = ref<'frontend' | 'backend' | ''>('')
const quizGroup = ref<QuizGroup | null>(null)
const correctCount = ref(0)
const lastChosenIndex = ref<number | null>(null)
const showResult = ref(false)
const lastResult = ref<GameResult | null>(null)

const started = computed(() => !!quizGroup.value)

const totalQuestions = computed(() => quizGroup.value?.questions.length ?? 0)
const currentNumber = computed(() => (quizGroup.value ? quizGroup.value.questionIndex + 1 : 0))
const currentQuestion = computed<QuizQuestion | null>(() => {
  if (!quizGroup.value) return null
  return quizGroup.value.questions[quizGroup.value.questionIndex] ?? null
})

const isFinished = computed(() =>
  quizGroup.value ? quizGroup.value.questionIndex >= quizGroup.value.questions.length : false,
)

function onStart() {
  if (!selectedTopic.value) return
  const pool: QuizQuestion[] =
    selectedTopic.value === 'frontend' ? (frontend as QuizQuestion[]) : (backend as QuizQuestion[])
  const picked = pickRandom(pool, QUESTIONS_PER_QUIZ)
  quizGroup.value = {
    groupName: selectedTopic.value,
    questions: picked,
    questionIndex: 0,
  }
  correctCount.value = 0
  lastChosenIndex.value = null
  game.startGame(GAMETYPE.QUIZ)
}

function choose(index: number) {
  if (!quizGroup.value || isFinished.value) return
  lastChosenIndex.value = index
  const q = currentQuestion.value
  if (q && index === q.correctAnswerIndex) {
    correctCount.value++
  }
  // move next or finish
  if (quizGroup.value.questionIndex + 1 >= quizGroup.value.questions.length) {
    // finished
    quizGroup.value.questionIndex = quizGroup.value.questions.length // mark finished beyond last index
    finish()
  } else {
    quizGroup.value.questionIndex++
    // clear selection for the next question
    lastChosenIndex.value = null
  }
}

function finish() {
  // derive simple result
  const total = totalQuestions.value
  const score = correctCount.value
  const threshold = Math.ceil(total * 0.6)
  const result = score >= threshold ? GameResult.WIN : GameResult.LOSS
  lastResult.value = result
  leaderboard.addEntry({
    playerName: game.playerName ?? 'Anonymous',
    score,
    gameResult: result,
    losses: total - score,
    runs: total,
    gameType: GAMETYPE.QUIZ,
    date: new Date().toISOString(),
  })
  game.finishGame()
  showResult.value = true
}

function restart() {
  showResult.value = false
  lastResult.value = null
  quizGroup.value = null
  selectedTopic.value = ''
  correctCount.value = 0
  lastChosenIndex.value = null
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = arr.slice()
  // Fisher–Yates shuffle up to n
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}
</script>

<style scoped lang="sass"></style>
