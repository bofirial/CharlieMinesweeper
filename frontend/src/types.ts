export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isExploded?: boolean;
}

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
  name: 'Peaceful' | 'Super Easy' | 'Easy' | 'Easy Bomb Rally' | 'Beginner' | 'Bomb Rally' | 'Intermediate' | 'Medium Bomb Rally' | 'Expert' | 'Pro' | 'Master' | 'Impossible' | 'Chois' | 'Custom';
  redPaintBuckets: number;
  tealPaintBuckets: number;
  magentaPaintBuckets: number;
  tanPaintBuckets: number;
  rainbowPaintBuckets: number;
}

export const DIFFICULTIES: Record<Exclude<GameConfig['name'], 'Custom'>, GameConfig> = {
  Peaceful: {
    rows: 5,
    cols: 5,
    mines: 3,
    name: 'Peaceful',
    redPaintBuckets: Infinity,
    tealPaintBuckets: Infinity,
    magentaPaintBuckets: Infinity,
    tanPaintBuckets: Infinity,
    rainbowPaintBuckets: 1,
  },
  'Super Easy': {
    rows: 3,
    cols: 3,
    mines: 1,
    name: 'Super Easy',
    redPaintBuckets: Infinity,
    tealPaintBuckets: Infinity,
    magentaPaintBuckets: Infinity,
    tanPaintBuckets: Infinity,
    rainbowPaintBuckets: 1,
  },
  Easy: {
    rows: 7,
    cols: 7,
    mines: 6,
    name: 'Easy',
    redPaintBuckets: 100,
    tealPaintBuckets: 100,
    magentaPaintBuckets: 100,
    tanPaintBuckets: 100,
    rainbowPaintBuckets: 1,
  },
  'Easy Bomb Rally': {
    rows: 7,
    cols: 7,
    mines: 12,
    name: 'Easy Bomb Rally',
    redPaintBuckets: 100,
    tealPaintBuckets: 100,
    magentaPaintBuckets: 100,
    tanPaintBuckets: 100,
    rainbowPaintBuckets: 1,
  },
  Beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    name: 'Beginner',
    redPaintBuckets: 1,
    tealPaintBuckets: 1,
    magentaPaintBuckets: 1,
    tanPaintBuckets: 1,
    rainbowPaintBuckets: 1,
  },
  'Bomb Rally': {
    rows: 9,
    cols: 9,
    mines: 20,
    name: 'Bomb Rally',
    redPaintBuckets: 1,
    tealPaintBuckets: 1,
    magentaPaintBuckets: 1,
    tanPaintBuckets: 1,
    rainbowPaintBuckets: 1,
  },
  Intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    name: 'Intermediate',
    redPaintBuckets: 2,
    tealPaintBuckets: 3,
    magentaPaintBuckets: 3,
    tanPaintBuckets: 2,
    rainbowPaintBuckets: 1,
  },
  'Medium Bomb Rally': {
    rows: 16,
    cols: 16,
    mines: 80,
    name: 'Medium Bomb Rally',
    redPaintBuckets: 2,
    tealPaintBuckets: 3,
    magentaPaintBuckets: 3,
    tanPaintBuckets: 2,
    rainbowPaintBuckets: 1,
  },
  Expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    name: 'Expert',
    redPaintBuckets: 3,
    tealPaintBuckets: 5,
    magentaPaintBuckets: 5,
    tanPaintBuckets: 3,
    rainbowPaintBuckets: 1,
  },
  Pro: {
    rows: 18,
    cols: 30,
    mines: 120,
    name: 'Pro',
    redPaintBuckets: 4,
    tealPaintBuckets: 6,
    magentaPaintBuckets: 6,
    tanPaintBuckets: 4,
    rainbowPaintBuckets: 1,
  },
  Master: {
    rows: 20,
    cols: 30,
    mines: 150,
    name: 'Master',
    redPaintBuckets: 4,
    tealPaintBuckets: 7,
    magentaPaintBuckets: 7,
    tanPaintBuckets: 4,
    rainbowPaintBuckets: 1,
  },
  Impossible: {
    rows: 24,
    cols: 30,
    mines: 216,
    name: 'Impossible',
    redPaintBuckets: 0,
    tealPaintBuckets: 0,
    magentaPaintBuckets: 0,
    tanPaintBuckets: 0,
    rainbowPaintBuckets: 1,
  },
  Chois: {
    rows: 10,
    cols: 10,
    mines: 15,
    name: 'Chois',
    redPaintBuckets: 5,
    tealPaintBuckets: 5,
    magentaPaintBuckets: 5,
    tanPaintBuckets: 5,
    rainbowPaintBuckets: 2,
  },
};

export interface HighScoreEntry {
  playerName: string;
  time: number;
  timestamp: string;
}
