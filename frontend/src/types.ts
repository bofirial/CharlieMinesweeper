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
  name: 'Beginner' | 'Intermediate' | 'Expert' | 'Master' | 'Custom';
  redPaintBuckets: number;
  bluePaintBuckets: number;
}

export const DIFFICULTIES: Record<Exclude<GameConfig['name'], 'Custom'>, GameConfig> = {
  Beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    name: 'Beginner',
    redPaintBuckets: 1,
    bluePaintBuckets: 1,
  },
  Intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    name: 'Intermediate',
    redPaintBuckets: 2,
    bluePaintBuckets: 3,
  },
  Expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    name: 'Expert',
    redPaintBuckets: 3,
    bluePaintBuckets: 5,
  },
  Master: {
    rows: 20,
    cols: 30,
    mines: 150,
    name: 'Master',
    redPaintBuckets: 4,
    bluePaintBuckets: 7,
  },
};
