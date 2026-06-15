import React, { useState } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { Cell } from './Cell';
import { DIFFICULTIES, type GameConfig } from '../types';
import { FeedbackModal } from './FeedbackModal';

export const Minesweeper: React.FC = () => {
  const {
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
    isImpossibleUnlocked,
    isProUnlocked,
    isEasyUnlocked,
    resetUnlocks,
  } = useMinesweeper();

  const [isGridMouseDown, setIsGridMouseDown] = useState(false);
  const [activePaintMode, setActivePaintMode] = useState<'none' | 'red' | 'red-deluxe' | 'teal' | 'teal-deluxe' | 'magenta' | 'magenta-deluxe'>('none');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Helper to pad numbers to 3 digits (e.g. 008, 099, -05)
  const formatNumber = (num: number): string => {
    const isNegative = num < 0;
    const absoluteNum = Math.abs(num);
    const padded = String(absoluteNum).padStart(3, '0');
    return (isNegative ? '-' : '') + padded.substring(padded.length - 3);
  };

  // Helper to format paint bucket count (supporting Infinity)
  const formatPaintCount = (count: number): string => {
    return count === Infinity ? '∞' : String(count);
  };

  // Get current status face emoji
  const getFaceEmoji = (): string => {
    switch (gameState) {
      case 'won':
        return '😎';
      case 'lost':
        return '😵';
      case 'playing':
        return isGridMouseDown ? '😮' : '🙂';
      case 'idle':
      default:
        return '🙂';
    }
  };

  const handleDifficultyChange = (difficulty: Exclude<GameConfig['name'], 'Custom'>) => {
    setActivePaintMode('none');
    setHoveredCell(null);
    resetGame(DIFFICULTIES[difficulty]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (activePaintMode === 'red') {
      paintFlags(row, col, false);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'red-deluxe') {
      paintFlags(row, col, true);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'teal') {
      revealAdjacentCells(row, col, false);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'teal-deluxe') {
      revealAdjacentCells(row, col, true);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'magenta') {
      revealMagentaAdjacentCells(row, col, false);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'magenta-deluxe') {
      revealMagentaAdjacentCells(row, col, true);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else {
      revealCell(row, col);
    }
  };

  const isCellHighlighted = (r: number, c: number): 'none' | 'red' | 'teal' | 'magenta' | 'deluxe' => {
    if (activePaintMode === 'none' || !hoveredCell) return 'none';
    const { r: hr, c: hc } = hoveredCell;
    
    let isDeluxe = false;
    let limit = 1;
    let color: 'red' | 'teal' | 'magenta' = 'red';
    
    if (activePaintMode === 'red') {
      limit = 1; color = 'red';
    } else if (activePaintMode === 'red-deluxe') {
      limit = 2; isDeluxe = true; color = 'red';
    } else if (activePaintMode === 'teal') {
      limit = 1; color = 'teal';
    } else if (activePaintMode === 'teal-deluxe') {
      limit = 2; isDeluxe = true; color = 'teal';
    } else if (activePaintMode === 'magenta') {
      limit = 1; color = 'magenta';
    } else if (activePaintMode === 'magenta-deluxe') {
      limit = 2; isDeluxe = true; color = 'magenta';
    }
    
    const isNeighbor = Math.abs(r - hr) <= limit && Math.abs(c - hc) <= limit;
    const isSelf = r === hr && c === hc;
    if (isNeighbor && !isSelf) {
      return isDeluxe ? 'deluxe' : color;
    }
    return 'none';
  };

  return (
    <div className="app-container">
      <div className="title-container">
        <h1 className="app-title">Minesweeper</h1>
      </div>

      <div className="controls-container">
        {(Object.keys(DIFFICULTIES) as Array<Exclude<GameConfig['name'], 'Custom'>>).map((diff) => {
          if ((diff === 'Easy' || diff === 'Easy Bomb Rally') && !isEasyUnlocked) return null;
          if (diff === 'Impossible' && !isImpossibleUnlocked) return null;
          if (diff === 'Pro' && !isProUnlocked) return null;
          return (
            <button
              key={diff}
              className={`difficulty-btn ${config.name === diff ? 'active' : ''}`}
              onClick={() => handleDifficultyChange(diff)}
            >
              {diff}
            </button>
          );
        })}
        <button
          className="reset-unlocks-btn"
          onClick={resetUnlocks}
          title="Reset all progress and locked difficulties"
        >
          Reset Unlocks
        </button>
        <button
          className="feedback-trigger-btn"
          onClick={() => setIsFeedbackOpen(true)}
          title="Provide feedback on the game features and colors"
        >
          ✍️ Feedback
        </button>
      </div>

      <div className="tools-container">
        {/* Red Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn red-paint ${activePaintMode === 'red' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'red' ? 'none' : 'red')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || paintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Red Paint Bucket: Click a tile to start the game before using this tool"
              : paintBucketsRemaining <= 0
              ? "Red Paint Bucket: No uses remaining"
              : `Red Paint Bucket: Flag all adjacent mines in a 3x3 area. (${formatPaintCount(paintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={paintBucketsRemaining <= 0 ? "#475569" : "#ef4444"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={paintBucketsRemaining <= 0 ? "#475569" : "#ef4444"} />
          </svg>
          <span>Red Paint ({formatPaintCount(paintBucketsRemaining)})</span>
        </button>

        {/* Deluxe Red Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn red-paint deluxe ${activePaintMode === 'red-deluxe' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'red-deluxe' ? 'none' : 'red-deluxe')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || deluxePaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Deluxe Red Paint Bucket: Click a tile to start the game before using this tool"
              : deluxePaintBucketsRemaining <= 0
              ? "Deluxe Red Paint Bucket: No uses remaining"
              : `Deluxe Red Paint Bucket: Flag all adjacent mines in a 5x5 area. (${formatPaintCount(deluxePaintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={deluxePaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={deluxePaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
          </svg>
          <span>Deluxe Red Paint ({formatPaintCount(deluxePaintBucketsRemaining)})</span>
        </button>

        {/* Teal Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn teal-paint ${activePaintMode === 'teal' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'teal' ? 'none' : 'teal')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || tealPaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Teal Paint Bucket: Click a tile to start the game before using this tool"
              : tealPaintBucketsRemaining <= 0
              ? "Teal Paint Bucket: No uses remaining"
              : `Teal Paint Bucket: Reveal adjacent 1s and 2s in a 3x3 area. (${formatPaintCount(tealPaintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={tealPaintBucketsRemaining <= 0 ? "#475569" : "#14b8a6"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={tealPaintBucketsRemaining <= 0 ? "#475569" : "#14b8a6"} />
          </svg>
          <span>Teal Paint ({formatPaintCount(tealPaintBucketsRemaining)})</span>
        </button>

        {/* Deluxe Teal Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn teal-paint deluxe ${activePaintMode === 'teal-deluxe' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'teal-deluxe' ? 'none' : 'teal-deluxe')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || deluxeTealPaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Deluxe Teal Paint Bucket: Click a tile to start the game before using this tool"
              : deluxeTealPaintBucketsRemaining <= 0
              ? "Deluxe Teal Paint Bucket: No uses remaining"
              : `Deluxe Teal Paint Bucket: Reveal adjacent 1s and 2s in a 5x5 area. (${formatPaintCount(deluxeTealPaintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={deluxeTealPaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={deluxeTealPaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
          </svg>
          <span>Deluxe Teal Paint ({formatPaintCount(deluxeTealPaintBucketsRemaining)})</span>
        </button>

        {/* Magenta Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn magenta-paint ${activePaintMode === 'magenta' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'magenta' ? 'none' : 'magenta')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || magentaPaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Magenta Paint Bucket: Click a tile to start the game before using this tool"
              : magentaPaintBucketsRemaining <= 0
              ? "Magenta Paint Bucket: No uses remaining"
              : `Magenta Paint Bucket: Reveal adjacent 3s and 4s in a 3x3 area. (${formatPaintCount(magentaPaintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={magentaPaintBucketsRemaining <= 0 ? "#475569" : "#d946ef"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={magentaPaintBucketsRemaining <= 0 ? "#475569" : "#d946ef"} />
          </svg>
          <span>Magenta Paint ({formatPaintCount(magentaPaintBucketsRemaining)})</span>
        </button>

        {/* Deluxe Magenta Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn magenta-paint deluxe ${activePaintMode === 'magenta-deluxe' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'magenta-deluxe' ? 'none' : 'magenta-deluxe')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || deluxeMagentaPaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Deluxe Magenta Paint Bucket: Click a tile to start the game before using this tool"
              : deluxeMagentaPaintBucketsRemaining <= 0
              ? "Deluxe Magenta Paint Bucket: No uses remaining"
              : `Deluxe Magenta Paint Bucket: Reveal adjacent 3s and 4s in a 5x5 area. (${formatPaintCount(deluxeMagentaPaintBucketsRemaining)} remaining)`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="paint-bucket-svg"
          >
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z" />
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={deluxeMagentaPaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={deluxeMagentaPaintBucketsRemaining <= 0 ? "#475569" : "#fbbf24"} />
          </svg>
          <span>Deluxe Magenta Paint ({formatPaintCount(deluxeMagentaPaintBucketsRemaining)})</span>
        </button>
      </div>

      <div className={`game-cabinet ${gameState}`}>
        <div className="game-header">
          {/* Flag / Mine Counter */}
          <div className="display-panel" title="Mines Remaining">
            <div className="display-value">
              {formatNumber(config.mines - flagCount)}
            </div>
          </div>

          {/* Smiley Reset Button */}
          <button
            className="face-button"
            onClick={() => {
              setActivePaintMode('none');
              setHoveredCell(null);
              resetGame();
            }}
            title="Reset Game"
          >
            <span className="face-emoji">{getFaceEmoji()}</span>
          </button>

          {/* Digital Timer */}
          <div className="display-panel" title="Time Elapsed">
            <div className="display-value">
              {formatNumber(timer)}
            </div>
          </div>
        </div>

        {/* Board Grid */}
        <div className="board-grid-wrapper">
          <div
            className={`board-grid ${activePaintMode !== 'none' ? 'paint-mode-active' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 32px)`,
            }}
            onMouseDown={() => setIsGridMouseDown(true)}
            onMouseUp={() => setIsGridMouseDown(false)}
            onMouseLeave={() => {
              setIsGridMouseDown(false);
              setHoveredCell(null);
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onFlag={() => toggleFlag(rowIndex, colIndex)}
                  onChord={() => chordCell(rowIndex, colIndex)}
                  isPaintHighlighted={isCellHighlighted(rowIndex, colIndex)}
                  onMouseEnter={() => activePaintMode !== 'none' && setHoveredCell({ r: rowIndex, c: colIndex })}
                  onMouseLeave={() => activePaintMode !== 'none' && setHoveredCell(null)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="game-instructions">
        <div className="desktop-only-instructions">
          💡 <span>Left-Click</span> to reveal tiles. <span>Right-Click</span> to place flags.<br />
          <span>Double-Click</span> or <span>Middle-Click</span> a revealed number to Chord.
        </div>
        <div className="mobile-only-instructions">
          📱 <span>Tap</span> to reveal. <span>Long-Press</span> to flag. <span>Double-Tap</span> a revealed number to Chord.
        </div>
        <div>
          🔴 <span>Red Paint</span> flags adjacent mines. 🌀 <span>Teal Paint</span> reveals adjacent 1s and 2s. 🟣 <span>Magenta Paint</span> reveals adjacent 3s and 4s (none reveals/flags the clicked tile itself).
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
};
