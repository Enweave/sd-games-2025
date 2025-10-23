import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { GAMETYPE } from '../types/game'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/tic',
    name: GAMETYPE.TIC,
    component: () => import('../pages/TicTakToe.vue'),
  },
  {
    path: '/dino',
    name: GAMETYPE.DINO,
    component: () => import('../pages/DinoRun.vue'),
  },
  {
    path: '/quiz',
    name: GAMETYPE.QUIZ,
    component: () => import('../pages/QuizGame.vue'),
  },
  // {
  //   path: '/motion',
  //   name: GAMETYPE.MOTION,
  //   component: () => import('../pages/MotionGame.vue'),
  // },
]

export const router = createRouter({
  history: createWebHistory('/sd-games-2025/'),
  routes,
})

export default router
