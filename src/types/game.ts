export enum GAMETYPE {
  TIC = 'Крестики-СДворики',
  DINO = 'Катим впрод!',
  QUIZ = 'Квиз',
}

export const enum GAMESTATUS {
  NOT_STARTED = 'NotStarted',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
}

export const enum GameResult {
  WIN = 'Win',
  LOSS = 'Loss',
  DRAW = 'Draw',
}

export interface ScoreEntry {
  playerName: string
  score: number
  gameResult: GameResult
  losses: number
  runs: number
  gameType: GAMETYPE
  date: string
}

export interface Leaderboard {
  entries: ScoreEntry[]
}

export interface GameState {
  currentGame: GAMETYPE | null
  gameStatus: GAMESTATUS
  playerName: string | null
  secondaryPlayerName: string | null
}
