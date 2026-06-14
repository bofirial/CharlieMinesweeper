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
  name: 'Peaceful' | 'Easy' | 'Beginner' | 'Bomb Rally' | 'Intermediate' | 'Expert' | 'Pro' | 'Master' | 'Impossible' | 'Custom';
  redPaintBuckets: number;
  bluePaintBuckets: number;
  greenPaintBuckets: number;
}

export const DIFFICULTIES: Record<Exclude<GameConfig['name'], 'Custom'>, GameConfig> = {
  Peaceful: {
    rows: 5,
    cols: 5,
    mines: 3,
    name: 'Peaceful',
    redPaintBuckets: Infinity,
    bluePaintBuckets: Infinity,
    greenPaintBuckets: Infinity,
  },
  Easy: {
    rows: 7,
    cols: 7,
    mines: 6,
    name: 'Easy',
    redPaintBuckets: 100,
    bluePaintBuckets: 100,
    greenPaintBuckets: 100,
  },
  Beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    name: 'Beginner',
    redPaintBuckets: 1,
    bluePaintBuckets: 1,
    greenPaintBuckets: 1,
  },
  'Bomb Rally': {
    rows: 9,
    cols: 9,
    mines: 20,
    name: 'Bomb Rally',
    redPaintBuckets: 1,
    bluePaintBuckets: 1,
    greenPaintBuckets: 1,
  },
  Intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    name: 'Intermediate',
    redPaintBuckets: 2,
    bluePaintBuckets: 3,
    greenPaintBuckets: 3,
  },
  Expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    name: 'Expert',
    redPaintBuckets: 3,
    bluePaintBuckets: 5,
    greenPaintBuckets: 5,
  },
  Pro: {
    rows: 18,
    cols: 30,
    mines: 120,
    name: 'Pro',
    redPaintBuckets: 4,
    bluePaintBuckets: 6,
    greenPaintBuckets: 6,
  },
  Master: {
    rows: 20,
    cols: 30,
    mines: 150,
    name: 'Master',
    redPaintBuckets: 4,
    bluePaintBuckets: 7,
    greenPaintBuckets: 7,
  },
  Impossible: {
    rows: 24,
    cols: 30,
    mines: 216,
    name: 'Impossible',
    redPaintBuckets: 0,
    bluePaintBuckets: 0,
    greenPaintBuckets: 0,
  },
};
