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
  name: 'Peaceful' | 'Easy' | 'Easy Bomb Rally' | 'Beginner' | 'Bomb Rally' | 'Intermediate' | 'Medium Bomb Rally' | 'Expert' | 'Pro' | 'Master' | 'Impossible' | 'Custom';
  redPaintBuckets: number;
  tealPaintBuckets: number;
  magentaPaintBuckets: number;
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
  },
  Easy: {
    rows: 7,
    cols: 7,
    mines: 6,
    name: 'Easy',
    redPaintBuckets: 100,
    tealPaintBuckets: 100,
    magentaPaintBuckets: 100,
  },
  'Easy Bomb Rally': {
    rows: 7,
    cols: 7,
    mines: 12,
    name: 'Easy Bomb Rally',
    redPaintBuckets: 100,
    tealPaintBuckets: 100,
    magentaPaintBuckets: 100,
  },
  Beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    name: 'Beginner',
    redPaintBuckets: 1,
    tealPaintBuckets: 1,
    magentaPaintBuckets: 1,
  },
  'Bomb Rally': {
    rows: 9,
    cols: 9,
    mines: 20,
    name: 'Bomb Rally',
    redPaintBuckets: 1,
    tealPaintBuckets: 1,
    magentaPaintBuckets: 1,
  },
  Intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    name: 'Intermediate',
    redPaintBuckets: 2,
    tealPaintBuckets: 3,
    magentaPaintBuckets: 3,
  },
  'Medium Bomb Rally': {
    rows: 16,
    cols: 16,
    mines: 80,
    name: 'Medium Bomb Rally',
    redPaintBuckets: 2,
    tealPaintBuckets: 3,
    magentaPaintBuckets: 3,
  },
  Expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    name: 'Expert',
    redPaintBuckets: 3,
    tealPaintBuckets: 5,
    magentaPaintBuckets: 5,
  },
  Pro: {
    rows: 18,
    cols: 30,
    mines: 120,
    name: 'Pro',
    redPaintBuckets: 4,
    tealPaintBuckets: 6,
    magentaPaintBuckets: 6,
  },
  Master: {
    rows: 20,
    cols: 30,
    mines: 150,
    name: 'Master',
    redPaintBuckets: 4,
    tealPaintBuckets: 7,
    magentaPaintBuckets: 7,
  },
  Impossible: {
    rows: 24,
    cols: 30,
    mines: 216,
    name: 'Impossible',
    redPaintBuckets: 0,
    tealPaintBuckets: 0,
    magentaPaintBuckets: 0,
  },
};
