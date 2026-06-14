import React, { useState } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { Cell } from './Cell';
import { DIFFICULTIES, type GameConfig } from '../types';

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
    hasUsedPaintBucket,
  } = useMinesweeper();

  const [isGridMouseDown, setIsGridMouseDown] = useState(false);
  const [isPaintModeActive, setIsPaintModeActive] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  // Helper to pad numbers to 3 digits (e.g. 008, 099, -05)
  const formatNumber = (num: number): string => {
    const isNegative = num < 0;
    const absoluteNum = Math.abs(num);
    const padded = String(absoluteNum).padStart(3, '0');
    return (isNegative ? '-' : '') + padded.substring(padded.length - 3);
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
    setIsPaintModeActive(false);
    setHoveredCell(null);
    resetGame(DIFFICULTIES[difficulty]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isPaintModeActive) {
      paintFlags(row, col);
      setIsPaintModeActive(false);
      setHoveredCell(null);
    } else {
      revealCell(row, col);
    }
  };

  const isCellHighlighted = (r: number, c: number): boolean => {
    if (!isPaintModeActive || !hoveredCell) return false;
    const { r: hr, c: hc } = hoveredCell;
    const isNeighbor = Math.abs(r - hr) <= 1 && Math.abs(c - hc) <= 1;
    const isSelf = r === hr && c === hc;
    return isNeighbor && !isSelf;
  };

  return (
    <div className="app-container">
      <div className="title-container">
        <h1 className="app-title">Minesweeper</h1>
        <div className="app-subtitle">React + TypeScript + .NET 8</div>
      </div>

      <div className="controls-container">
        {(Object.keys(DIFFICULTIES) as Array<Exclude<GameConfig['name'], 'Custom'>>).map((diff) => (
          <button
            key={diff}
            className={`difficulty-btn ${config.name === diff ? 'active' : ''}`}
            onClick={() => handleDifficultyChange(diff)}
          >
            {diff}
          </button>
        ))}
      </div>

      <div className="tools-container">
        <button
          className={`tool-btn paint-bucket-btn ${isPaintModeActive ? 'active' : ''}`}
          onClick={() => setIsPaintModeActive(!isPaintModeActive)}
          disabled={gameState === 'won' || gameState === 'lost' || hasUsedPaintBucket}
          title={hasUsedPaintBucket ? "Red Paint Bucket: Already used this game" : "Red Paint Bucket: Flag all adjacent mines. Single use per game."}
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
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={hasUsedPaintBucket ? "#475569" : "#ef4444"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={hasUsedPaintBucket ? "#475569" : "#ef4444"} />
          </svg>
          <span>Red Paint Bucket ({hasUsedPaintBucket ? 0 : 1})</span>
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
              setIsPaintModeActive(false);
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
            className={`board-grid ${isPaintModeActive ? 'paint-mode-active' : ''}`}
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
                  onMouseEnter={() => isPaintModeActive && setHoveredCell({ r: rowIndex, c: colIndex })}
                  onMouseLeave={() => isPaintModeActive && setHoveredCell(null)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="game-instructions">
        💡 <span>Left-Click</span> to reveal tiles. <span>Right-Click</span> to place flags.<br />
        <span>Double-Click</span> or <span>Middle-Click</span> a revealed number to Chord.<br />
        🔴 Select the <span>Red Paint Bucket</span> to flag all spaces touching the next tile you click (it does not flag the clicked space itself).
      </div>
    </div>
  );
};
