import { useState, useEffect, useRef, useCallback } from 'react';
import { type Cell, type GameState, type GameConfig, DIFFICULTIES, type HighScoreEntry } from '../types';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5045' : '';

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
  const [config, setConfig] = useState<GameConfig>(DIFFICULTIES.Peaceful);
  const [board, setBoard] = useState<Cell[][]>(() =>
    createEmptyBoard(DIFFICULTIES.Peaceful.rows, DIFFICULTIES.Peaceful.cols)
  );
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [paintBucketsRemaining, setPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.redPaintBuckets);
  const [deluxePaintBucketsRemaining, setDeluxePaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.redPaintBuckets);
  const [tealPaintBucketsRemaining, setTealPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.tealPaintBuckets);
  const [deluxeTealPaintBucketsRemaining, setDeluxeTealPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.tealPaintBuckets);
  const [magentaPaintBucketsRemaining, setMagentaPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.magentaPaintBuckets);
  const [deluxeMagentaPaintBucketsRemaining, setDeluxeMagentaPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.magentaPaintBuckets);
  const [tanPaintBucketsRemaining, setTanPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.tanPaintBuckets);
  const [deluxeTanPaintBucketsRemaining, setDeluxeTanPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.tanPaintBuckets);
  const [rainbowPaintBucketsRemaining, setRainbowPaintBucketsRemaining] = useState(DIFFICULTIES.Peaceful.rainbowPaintBuckets);
  const [deluxeRainbowPaintBucketsRemaining, setDeluxeRainbowPaintBucketsRemaining] = useState(0);
  const [isImpossibleUnlocked, setIsImpossibleUnlocked] = useState(() => {
    return localStorage.getItem('minesweeper_impossible_unlocked') === 'true';
  });
  const [isProUnlocked, setIsProUnlocked] = useState(() => {
    return localStorage.getItem('minesweeper_pro_unlocked') === 'true';
  });
  const [isEasyUnlocked, setIsEasyUnlocked] = useState(() => {
    return localStorage.getItem('minesweeper_easy_unlocked') === 'true';
  });
  const [hasFailedPeaceful, setHasFailedPeaceful] = useState(() => {
    return localStorage.getItem('minesweeper_peaceful_failed') === 'true';
  });

  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstClick = useRef(true);
  const timerRef = useRef(0);

  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem('minesweeper_player_name') || '');

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    localStorage.setItem('minesweeper_player_name', name);
  }, []);

  const [highScores, setHighScores] = useState<Record<string, HighScoreEntry[]>>({});

  const fetchHighScores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/highscores`);
      if (response.ok) {
        const data = await response.json();
        setHighScores(data);
      }
    } catch (e) {
      console.error("Error loading high scores:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHighScores();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

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
    // Roll deluxe and normal paints
    let normalRed = 0, deluxeRed = 0;
    if (activeConfig.redPaintBuckets === Infinity) {
      normalRed = Infinity;
      deluxeRed = (activeConfig.name === 'Peaceful' || activeConfig.name === 'Super Easy') ? 0 : Infinity;
    } else {
      for (let i = 0; i < activeConfig.redPaintBuckets; i++) {
        if (Math.random() < 0.1) deluxeRed++;
        else normalRed++;
      }
    }

    let normalTeal = 0, deluxeTeal = 0;
    if (activeConfig.tealPaintBuckets === Infinity) {
      normalTeal = Infinity;
      deluxeTeal = (activeConfig.name === 'Peaceful' || activeConfig.name === 'Super Easy') ? 0 : Infinity;
    } else {
      for (let i = 0; i < activeConfig.tealPaintBuckets; i++) {
        if (Math.random() < 0.1) deluxeTeal++;
        else normalTeal++;
      }
    }

    let normalMagenta = 0, deluxeMagenta = 0;
    if (activeConfig.magentaPaintBuckets === Infinity) {
      normalMagenta = Infinity;
      deluxeMagenta = (activeConfig.name === 'Peaceful' || activeConfig.name === 'Super Easy') ? 0 : Infinity;
    } else {
      for (let i = 0; i < activeConfig.magentaPaintBuckets; i++) {
        if (Math.random() < 0.1) deluxeMagenta++;
        else normalMagenta++;
      }
    }

    let normalTan = 0, deluxeTan = 0;
    if (activeConfig.tanPaintBuckets === Infinity) {
      normalTan = Infinity;
      deluxeTan = (activeConfig.name === 'Peaceful' || activeConfig.name === 'Super Easy') ? 0 : Infinity;
    } else {
      for (let i = 0; i < activeConfig.tanPaintBuckets; i++) {
        if (Math.random() < 0.1) deluxeTan++;
        else normalTan++;
      }
    }

    setPaintBucketsRemaining(normalRed);
    setDeluxePaintBucketsRemaining(deluxeRed);
    setTealPaintBucketsRemaining(normalTeal);
    setDeluxeTealPaintBucketsRemaining(deluxeTeal);
    setMagentaPaintBucketsRemaining(normalMagenta);
    setDeluxeMagentaPaintBucketsRemaining(deluxeMagenta);
    setTanPaintBucketsRemaining(normalTan);
    setDeluxeTanPaintBucketsRemaining(deluxeTan);
    let normalRainbow = 0, deluxeRainbow = 0;
    if (activeConfig.name === 'Peaceful' || activeConfig.name === 'Super Easy') {
      normalRainbow = activeConfig.rainbowPaintBuckets;
      deluxeRainbow = 0;
    } else {
      for (let i = 0; i < activeConfig.rainbowPaintBuckets; i++) {
        if (Math.random() < 0.1) deluxeRainbow++;
        else normalRainbow++;
      }
    }
    setRainbowPaintBucketsRemaining(normalRainbow);
    setDeluxeRainbowPaintBucketsRemaining(deluxeRainbow);

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

  // Helper to get a 5x5 area of neighbors around a cell
  const getNeighbors5x5 = useCallback((row: number, col: number, rows: number, cols: number) => {
    const neighbors: { r: number; c: number }[] = [];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
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
    const { rows, cols, mines, name } = config;
    let attempts = 0;
    let finalBoard = initialBoard;

    while (attempts < 100) {
      attempts++;
      const newBoard = JSON.parse(JSON.stringify(initialBoard)) as Cell[][];

      // Create a set of coordinates to avoid placing mines.
      // Classic rule: First clicked cell and its 8 neighbors are always safe.
      const safeZone = new Set<string>();
      safeZone.add(`${startRow},${startCol}`);
      
      const neighbors = getNeighbors(startRow, startCol, rows, cols);
      // Only make neighbors safe if we have enough space remaining to place all mines
      if ((rows * cols) - 1 - neighbors.length > mines) {
        neighbors.forEach((n) => {
          safeZone.add(`${n.r},${n.c}`);
        });
      }

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
      let count4s = 0;
      let count5s = 0;
      let count6s = 0;
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
          if (count === 4) {
            count4s++;
          } else if (count === 5) {
            count5s++;
          } else if (count === 6) {
            count6s++;
          }
        }
      }

      finalBoard = newBoard;

      // Ensure more 4s, 5s, and 6s for respective Bomb Rally difficulties
      if (name === 'Easy Bomb Rally' || name === 'Bomb Rally') {
        const target4s = name === 'Easy Bomb Rally' ? 2 : 3;
        if (count4s >= target4s) {
          break;
        }
      } else if (name === 'Medium Bomb Rally') {
        if (count4s >= 24 && count5s >= 9 && count6s >= 2) {
          break;
        }
      } else {
        break;
      }
    }

    return finalBoard;
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


  // Central win condition helper to track best time/high score and unlocks
  const handleWin = useCallback((currentBoard: Cell[][]) => {
    setGameState('won');

    const finalTime = timerRef.current;
    const activePlayerName = playerName.trim() || 'Anonymous Raider';

    setHighScores((prev) => {
      const currentList = prev[config.name] || [];
      const newEntry: HighScoreEntry = {
        playerName: activePlayerName,
        time: finalTime,
        timestamp: new Date().toISOString()
      };
      const updatedList = [...currentList, newEntry].sort((a, b) => a.time - b.time).slice(0, 10);
      return { ...prev, [config.name]: updatedList };
    });

    fetch(`${API_BASE_URL}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: activePlayerName, difficulty: config.name, time: finalTime }),
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setHighScores(data);
        }
      })
      .catch((err) => console.error("Error saving high score to backend:", err));

    if (config.name === 'Peaceful' && !hasFailedPeaceful) {
      localStorage.setItem('minesweeper_easy_unlocked', 'true');
      setIsEasyUnlocked(true);
    }
    if (config.name === 'Master') {
      localStorage.setItem('minesweeper_impossible_unlocked', 'true');
      setIsImpossibleUnlocked(true);
    }
    if (config.name === 'Expert') {
      localStorage.setItem('minesweeper_pro_unlocked', 'true');
      setIsProUnlocked(true);
    }

    // Auto-flag all remaining unrevealed mines
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (currentBoard[r][c].isMine) {
          currentBoard[r][c].isFlagged = true;
        }
      }
    }
    setFlagCount(config.mines);
  }, [config.name, config.rows, config.cols, config.mines, hasFailedPeaceful, setIsEasyUnlocked, setIsProUnlocked, setIsImpossibleUnlocked, setFlagCount, playerName]);

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
      if (config.name === 'Peaceful') {
        localStorage.setItem('minesweeper_peaceful_failed', 'true');
        setHasFailedPeaceful(true);
      }
      
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
      handleWin(currentBoard);
    }

    setBoard(currentBoard);
  }, [board, gameState, config, initializeMinesAndNeighbors, checkWinCondition, revealEmptyCells, handleWin]);

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
        if (config.name === 'Peaceful') {
          localStorage.setItem('minesweeper_peaceful_failed', 'true');
          setHasFailedPeaceful(true);
        }
        // Reveal all mines
        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            if (currentBoard[r][c].isMine) {
              currentBoard[r][c].isRevealed = true;
            }
          }
        }
      } else if (checkWinCondition(currentBoard)) {
        handleWin(currentBoard);
      }

      setBoard(currentBoard);
    }
  }, [board, gameState, config, getNeighbors, checkWinCondition, revealEmptyCells, handleWin]);

  // Paint flags on all unrevealed neighbors of (row, col)
  const paintFlags = useCallback((row: number, col: number, isDeluxe: boolean) => {
    const bucketsRemaining = isDeluxe ? deluxePaintBucketsRemaining : paintBucketsRemaining;
    if (gameState === 'won' || gameState === 'lost' || bucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = isDeluxe 
      ? getNeighbors5x5(row, col, config.rows, config.cols) 
      : getNeighbors(row, col, config.rows, config.cols);
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
    if (isDeluxe) {
      setDeluxePaintBucketsRemaining((p) => p - 1);
    } else {
      setPaintBucketsRemaining((p) => p - 1);
    }
    if (config.name === 'Chois') {
      setTimer((t) => t + (isDeluxe ? 10 : 5));
    }
  }, [board, gameState, paintBucketsRemaining, deluxePaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, getNeighbors5x5, setTimer]);

  // Paint bucket revealing tool: reveals all adjacent unrevealed, unflagged tiles of (row, col)
  // that have exactly 1 or 2 adjacent mines.
  // Safely skips revealing adjacent mines so they do not detonate!
  const revealAdjacentCells = useCallback((row: number, col: number, isDeluxe: boolean) => {
    const bucketsRemaining = isDeluxe ? deluxeTealPaintBucketsRemaining : tealPaintBucketsRemaining;
    if (gameState === 'won' || gameState === 'lost' || bucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = isDeluxe
      ? getNeighbors5x5(row, col, config.rows, config.cols)
      : getNeighbors(row, col, config.rows, config.cols);

    for (const adj of adjacents) {
      const neighbor = currentBoard[adj.r][adj.c];
      // Only reveal if neighbor is unrevealed, unflagged, not a mine, and has exactly 1 or 2 adjacent mines
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine && (neighbor.neighborMines === 1 || neighbor.neighborMines === 2)) {
        neighbor.isRevealed = true;
      }
    }

    if (checkWinCondition(currentBoard)) {
      handleWin(currentBoard);
    }

    setBoard(currentBoard);
    if (isDeluxe) {
      setDeluxeTealPaintBucketsRemaining((p) => p - 1);
    } else {
      setTealPaintBucketsRemaining((p) => p - 1);
    }
    if (config.name === 'Chois') {
      setTimer((t) => t + (isDeluxe ? 10 : 5));
    }
  }, [board, gameState, tealPaintBucketsRemaining, deluxeTealPaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, getNeighbors5x5, checkWinCondition, handleWin, setTimer]);

  // Paint bucket revealing tool: reveals all adjacent unrevealed, unflagged tiles of (row, col)
  // that have exactly 3 or 4 adjacent mines.
  // Safely skips revealing adjacent mines so they do not detonate!
  const revealMagentaAdjacentCells = useCallback((row: number, col: number, isDeluxe: boolean) => {
    const bucketsRemaining = isDeluxe ? deluxeMagentaPaintBucketsRemaining : magentaPaintBucketsRemaining;
    if (gameState === 'won' || gameState === 'lost' || bucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = isDeluxe
      ? getNeighbors5x5(row, col, config.rows, config.cols)
      : getNeighbors(row, col, config.rows, config.cols);

    for (const adj of adjacents) {
      const neighbor = currentBoard[adj.r][adj.c];
      // Only reveal if neighbor is unrevealed, unflagged, not a mine, and has exactly 3 or 4 adjacent mines
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine && (neighbor.neighborMines === 3 || neighbor.neighborMines === 4)) {
        neighbor.isRevealed = true;
      }
    }

    if (checkWinCondition(currentBoard)) {
      handleWin(currentBoard);
    }

    setBoard(currentBoard);
    if (isDeluxe) {
      setDeluxeMagentaPaintBucketsRemaining((p) => p - 1);
    } else {
      setMagentaPaintBucketsRemaining((p) => p - 1);
    }
    if (config.name === 'Chois') {
      setTimer((t) => t + (isDeluxe ? 10 : 5));
    }
  }, [board, gameState, magentaPaintBucketsRemaining, deluxeMagentaPaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, getNeighbors5x5, checkWinCondition, handleWin, setTimer]);

  // Paint bucket revealing tool: reveals all adjacent unrevealed, unflagged tiles of (row, col)
  // that have exactly 5, 6, or 7 adjacent mines.
  // Safely skips revealing adjacent mines so they do not detonate!
  const revealTanAdjacentCells = useCallback((row: number, col: number, isDeluxe: boolean) => {
    const bucketsRemaining = isDeluxe ? deluxeTanPaintBucketsRemaining : tanPaintBucketsRemaining;
    if (gameState === 'won' || gameState === 'lost' || bucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = isDeluxe
      ? getNeighbors5x5(row, col, config.rows, config.cols)
      : getNeighbors(row, col, config.rows, config.cols);

    for (const adj of adjacents) {
      const neighbor = currentBoard[adj.r][adj.c];
      // Only reveal if neighbor is unrevealed, unflagged, not a mine, and has exactly 5, 6, or 7 adjacent mines
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine && (neighbor.neighborMines === 5 || neighbor.neighborMines === 6 || neighbor.neighborMines === 7)) {
        neighbor.isRevealed = true;
      }
    }

    if (checkWinCondition(currentBoard)) {
      handleWin(currentBoard);
    }

    setBoard(currentBoard);
    if (isDeluxe) {
      setDeluxeTanPaintBucketsRemaining((p) => p - 1);
    } else {
      setTanPaintBucketsRemaining((p) => p - 1);
    }
    if (config.name === 'Chois') {
      setTimer((t) => t + (isDeluxe ? 10 : 5));
    }
  }, [board, gameState, tanPaintBucketsRemaining, deluxeTanPaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, getNeighbors5x5, checkWinCondition, handleWin, setTimer]);

  // Rainbow paint revealing tool: flags all adjacent mines and reveals all adjacent safe cells in a 3x3 (normal) or 5x5 (deluxe) area safely
  const revealRainbowAdjacentCells = useCallback((row: number, col: number, isDeluxe: boolean) => {
    const bucketsRemaining = isDeluxe ? deluxeRainbowPaintBucketsRemaining : rainbowPaintBucketsRemaining;
    if (gameState === 'won' || gameState === 'lost' || bucketsRemaining <= 0) return;

    let currentBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

    // If first click, initialize the board first
    if (isFirstClick.current) {
      isFirstClick.current = false;
      currentBoard = initializeMinesAndNeighbors(currentBoard, row, col);
      setGameState('playing');
    }

    const adjacents = isDeluxe
      ? getNeighbors5x5(row, col, config.rows, config.cols)
      : getNeighbors(row, col, config.rows, config.cols);
    let flagsAdded = 0;

    for (const adj of adjacents) {
      const neighbor = currentBoard[adj.r][adj.c];
      if (!neighbor.isRevealed) {
        if (neighbor.isMine) {
          if (!neighbor.isFlagged) {
            neighbor.isFlagged = true;
            flagsAdded++;
          }
        } else {
          if (neighbor.isFlagged) {
            neighbor.isFlagged = false;
            flagsAdded--;
          }
          if (neighbor.neighborMines === 0) {
            revealEmptyCells(currentBoard, adj.r, adj.c);
          } else {
            neighbor.isRevealed = true;
          }
        }
      }
    }

    if (flagsAdded !== 0) {
      setFlagCount((f) => f + flagsAdded);
    }

    if (checkWinCondition(currentBoard)) {
      handleWin(currentBoard);
    }

    setBoard(currentBoard);
    if (isDeluxe) {
      setDeluxeRainbowPaintBucketsRemaining((p) => p - 1);
    } else {
      setRainbowPaintBucketsRemaining((p) => p - 1);
    }
    if (config.name === 'Chois') {
      setTimer((t) => t + (isDeluxe ? 10 : 5));
    }
  }, [board, gameState, rainbowPaintBucketsRemaining, deluxeRainbowPaintBucketsRemaining, config, initializeMinesAndNeighbors, getNeighbors, getNeighbors5x5, revealEmptyCells, checkWinCondition, handleWin, setFlagCount, setTimer]);



  const resetUnlocks = useCallback(() => {
    localStorage.removeItem('minesweeper_easy_unlocked');
    localStorage.removeItem('minesweeper_pro_unlocked');
    localStorage.removeItem('minesweeper_impossible_unlocked');
    localStorage.removeItem('minesweeper_peaceful_failed');
    localStorage.removeItem('minesweeper_high_scores');
    setIsEasyUnlocked(false);
    setIsProUnlocked(false);
    setIsImpossibleUnlocked(false);
    setHasFailedPeaceful(false);
    setHighScores({});

    fetch(`${API_BASE_URL}/api/highscores`, {
      method: 'DELETE',
    }).catch((err) => console.error("Error clearing high scores on backend:", err));

    // Reset difficulty if the active one is locked now
    if (config.name === 'Easy' || config.name === 'Easy Bomb Rally' || config.name === 'Pro' || config.name === 'Impossible') {
      resetGame(DIFFICULTIES.Peaceful);
    }
  }, [config, resetGame]);

  const resetHighScores = useCallback(() => {
    localStorage.removeItem('minesweeper_high_scores');
    setHighScores({});

    fetch(`${API_BASE_URL}/api/highscores`, {
      method: 'DELETE',
    }).catch((err) => console.error("Error clearing high scores on backend:", err));
  }, []);

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
    deluxePaintBucketsRemaining,
    revealAdjacentCells,
    tealPaintBucketsRemaining,
    deluxeTealPaintBucketsRemaining,
    revealMagentaAdjacentCells,
    magentaPaintBucketsRemaining,
    deluxeMagentaPaintBucketsRemaining,
    revealTanAdjacentCells,
    tanPaintBucketsRemaining,
    deluxeTanPaintBucketsRemaining,
    revealRainbowAdjacentCells,
    rainbowPaintBucketsRemaining,
    deluxeRainbowPaintBucketsRemaining,
    isImpossibleUnlocked,
    isProUnlocked,
    isEasyUnlocked,
    resetUnlocks,
    highScores,
    resetHighScores,
    playerName,
    setPlayerName,
  };
}
