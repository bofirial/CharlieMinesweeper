import { useState, useEffect, useRef, useCallback } from 'react';
import { type Cell, type GameState, type GameConfig, DIFFICULTIES } from '../types';

// Initialize an empty board filled with default cells
const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  const newBoard: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const rowCells: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      rowCells.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    newBoard.push(rowCells);
  }
  return newBoard;
};

export function useMinesweeper() {
  const [config, setConfig] = useState<GameConfig>(DIFFICULTIES.Beginner);
  const [board, setBoard] = useState<Cell[][]>(() =>
    createEmptyBoard(DIFFICULTIES.Beginner.rows, DIFFICULTIES.Beginner.cols)
  );
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [paintBucketsRemaining, setPaintBucketsRemaining] = useState(DIFFICULTIES.Beginner.redPaintBuckets);
  const [bluePaintBucketsRemaining, setBluePaintBucketsRemaining] = useState(DIFFICULTIES.Beginner.bluePaintBuckets);

  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstClick = useRef(true);

  // Reset the game state
  const resetGame = useCallback((newConfig?: GameConfig) => {
    const activeConfig = newConfig || config;
    if (newConfig) {
      setConfig(newConfig);
    }

    // Clear any active timer
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    setBoard(createEmptyBoard(activeConfig.rows, activeConfig.cols));
    setGameState('idle');
    setTimer(0);
    setFlagCount(0);
    setPaintBucketsRemaining(activeConfig.redPaintBuckets);
    setBluePaintBucketsRemaining(activeConfig.bluePaintBuckets);
    isFirstClick.current = true;
  }, [config]);


  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      timerId.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    }

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    };
  }, [gameState]);

  // Check if win condition is met (all non-mine cells revealed)
  const checkWinCondition = useCallback((currentBoard: Cell[][]): boolean => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const cell = currentBoard[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  }, [config.rows, config.cols]);

  // Helper to get all valid adjacent neighbors of a cell
  const getNeighbors = useCallback((row: number, col: number, rows: number, cols: number) => {
    const neighbors: { r: number; c: number }[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  }, []);

  // Initialize mines and calculate neighbor counts (triggered on first click)
  const initializeMinesAndNeighbors = useCallback((
    initialBoard: Cell[][],
    startRow: number,
    startCol: number
  ): Cell[][] => {
    const { rows, cols, mines } = config;
    const newBoard = JSON.parse(JSON.stringify(initialBoard)) as Cell[][];

    // Create a set of coordinates to avoid placing mines.
    // Classic rule: First clicked cell and its 8 neighbors are always safe.
    const safeZone = new Set<string>();
    safeZone.add(`${startRow},${startCol}`);
    getNeighbors(startRow, startCol, rows, cols).forEach((n) => {
      safeZone.add(`${n.r},${n.c}`);
    });

    // Randomly place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);
      const coordKey = `${randomRow},${randomCol}`;

      if (!newBoard[randomRow][randomCol].isMine && !safeZone.has(coordKey)) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].isMine) continue;
        let count = 0;
        getNeighbors(r, c, rows, cols).forEach((n) => {
          if (newBoard[n.r][n.c].isMine) {
            count++;
          }
        });
        newBoard[r][c].neighborMines = count;
      }
    }

    return newBoard;
  }, [config, getNeighbors]);

  // Recursively reveal cells starting from (row, col) - Flood Fill
  const revealEmptyCells = useCallback((
    currentBoard: Cell[][],
    startRow: number,
    startCol: number
  ) => {
    const queue: { r: number; c: number }[] = [{ r: startRow, c: startCol }];
    currentBoard[startRow][startCol].isRevealed = true;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const cell = currentBoard[curr.r][curr.c];

      // If the cell has adjacent mines, stop revealing neighbors
      if (cell.neighborMines > 0) continue;

      const adjacents = getNeighbors(curr.r, curr.c, config.rows, config.cols);
      for (const adj of adjacents) {
        const neighbor = currentBoard[adj.r][adj.c];
        if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
          neighbor.isRevealed = true;
          queue.push({ r: adj.r, c: adj.c });
        }
      }
    }
  }, [getNeighbors, config.rows, config.cols]);

  // Click handler to reveal a cell
  const revealCell = useCallback((row: number, col: number) => {
    if (gameState === 'won' || gameState === 'lost') return;
    
    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];
    const targetCell = currentBoard[row][col];
    
    if (targetCell.isRevealed || targetCell.isFlagged) return;

    // First click logic - generate mines and ensure first click safety
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const cell = currentBoard[row][col];

    // Mine clicked - Game Over
    if (cell.isMine) {
      cell.isRevealed = true;
      cell.isExploded = true;
      setGameState('lost');
      
      // Reveal all mines on the board
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (currentBoard[r][c].isMine) {
            currentBoard[r][c].isRevealed = true;
          }
        }
      }
      setBoard(currentBoard);
      return;
    }

    // Safe cell clicked - Reveal and check flood-fill
    revealEmptyCells(currentBoard, row, col);

    // Check win condition
    if (checkWinCondition(currentBoard)) {
      setGameState('won');
      // Auto-flag all remaining unrevealed mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (currentBoard[r][c].isMine) {
            currentBoard[r][c].isFlagged = true;
          }
        }
      }
      setFlagCount(config.mines);
    }

    setBoard(currentBoard);
  }, [board, gameState, config, initializeMinesAndNeighbors, checkWinCondition, revealEmptyCells]);

  // Right-click handler to toggle flags
  const toggleFlag = useCallback((row: number, col: number) => {
    if (gameState === 'won' || gameState === 'lost') return;
    
    // We cannot flag on the first click
    if (isFirstClick.current) return;

    const currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];
    const targetCell = currentBoard[row][col];

    if (targetCell.isRevealed) return;

    const newFlaggedState = !targetCell.isFlagged;
    targetCell.isFlagged = newFlaggedState;

    setFlagCount((f) => f + (newFlaggedState ? 1 : -1));
    setBoard(currentBoard);
  }, [board, gameState]);

  // Chording: Double-click or Middle-click on a revealed number cell.
  // If the number of adjacent flags matches the number of neighbor mines,
  // reveal all remaining unflagged adjacent cells.
  const chordCell = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    const currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];
    const cell = currentBoard[row][col];

    if (!cell.isRevealed || cell.neighborMines === 0) return;

    const adjacents = getNeighbors(row, col, config.rows, config.cols);
    let adjacentFlags = 0;

    adjacents.forEach((n) => {
      if (currentBoard[n.r][n.c].isFlagged) {
        adjacentFlags++;
      }
    });

    // Only chord if flags match neighbor mines
    if (adjacentFlags === cell.neighborMines) {
      let hitMine = false;

      for (const adj of adjacents) {
        const neighbor = currentBoard[adj.r][adj.c];
        if (!neighbor.isRevealed && !neighbor.isFlagged) {
          if (neighbor.isMine) {
            hitMine = true;
            neighbor.isRevealed = true;
            neighbor.isExploded = true;
          } else {
            revealEmptyCells(currentBoard, adj.r, adj.c);
          }
        }
      }

      if (hitMine) {
        setGameState('lost');
        // Reveal all mines
        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            if (currentBoard[r][c].isMine) {
              currentBoard[r][c].isRevealed = true;
            }
          }
        }
      } else if (checkWinCondition(currentBoard)) {
        setGameState('won');
        // Auto-flag remaining
        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            if (currentBoard[r][c].isMine) {
              currentBoard[r][c].isFlagged = true;
            }
          }
        }
        setFlagCount(config.mines);
      }

      setBoard(currentBoard);
    }
  }, [board, gameState, config, getNeighbors, checkWinCondition, revealEmptyCells]);

  // Paint flags on all unrevealed neighbors of (row, col)
  const paintFlags = useCallback((row: number, col: number) => {
    if (gameState === 'won' || gameState === 'lost' || paintBucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = getNeighbors(row, col, config.rows, config.cols);
    let flagsAdded = 0;

    adjacents.forEach((n) => {
      const neighbor = currentBoard[n.r][n.c];
      if (!neighbor.isRevealed && !neighbor.isFlagged && neighbor.isMine) {
        neighbor.isFlagged = true;
        flagsAdded++;
      }
    });

    if (flagsAdded > 0) {
      setFlagCount((f) => f + flagsAdded);
    }
    setBoard(currentBoard);
    setPaintBucketsRemaining((p) => p - 1);
  }, [board, gameState, paintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors]);

  // Blue paint bucket: reveals all adjacent unrevealed, unflagged tiles of (row, col)
  // Safely skips revealing adjacent mines so they do not detonate!
  const revealAdjacentCells = useCallback((row: number, col: number) => {
    if (gameState === 'won' || gameState === 'lost' || bluePaintBucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = getNeighbors(row, col, config.rows, config.cols);

    for (const adj of adjacents) {
      const neighbor = currentBoard[adj.r][adj.c];
      // Only reveal if neighbor is unrevealed, unflagged, not a mine, and has exactly 1 adjacent mine
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine && neighbor.neighborMines === 1) {
        neighbor.isRevealed = true;
      }
    }

    if (checkWinCondition(currentBoard)) {
      setGameState('won');
      // Auto-flag remaining mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (currentBoard[r][c].isMine) {
            currentBoard[r][c].isFlagged = true;
          }
        }
      }
      setFlagCount(config.mines);
    }

    setBoard(currentBoard);
    setBluePaintBucketsRemaining((p) => p - 1);
  }, [board, gameState, bluePaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, checkWinCondition]);

  return {
    board,
    gameState,
    timer,
    flagCount,
    config,
    resetGame,
    revealCell,
    toggleFlag,
    chordCell,
    paintFlags,
    paintBucketsRemaining,
    revealAdjacentCells,
    bluePaintBucketsRemaining,
  };
}
