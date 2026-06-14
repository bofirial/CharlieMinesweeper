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
    paintBucketsRemaining,
    revealAdjacentCells,
    bluePaintBucketsRemaining,
    greenPaintBucketsRemaining,
    isImpossibleUnlocked,
  } = useMinesweeper();

  const [isGridMouseDown, setIsGridMouseDown] = useState(false);
  const [activePaintMode, setActivePaintMode] = useState<'none' | 'red' | 'blue' | 'green'>('none');
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
    setActivePaintMode('none');
    setHoveredCell(null);
    resetGame(DIFFICULTIES[difficulty]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (activePaintMode === 'red') {
      paintFlags(row, col);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'blue') {
      revealAdjacentCells(row, col, 1);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else if (activePaintMode === 'green') {
      revealAdjacentCells(row, col, 2);
      setActivePaintMode('none');
      setHoveredCell(null);
    } else {
      revealCell(row, col);
    }
  };

  const isCellHighlighted = (r: number, c: number): 'none' | 'red' | 'blue' | 'green' => {
    if (activePaintMode === 'none' || !hoveredCell) return 'none';
    const { r: hr, c: hc } = hoveredCell;
    const isNeighbor = Math.abs(r - hr) <= 1 && Math.abs(c - hc) <= 1;
    const isSelf = r === hr && c === hc;
    return isNeighbor && !isSelf ? activePaintMode : 'none';
  };

  return (
    <div className="app-container">
      <div className="title-container">
        <h1 className="app-title">Minesweeper</h1>
        <div className="app-subtitle">React + TypeScript + .NET 8</div>
      </div>

      <div className="controls-container">
        {(Object.keys(DIFFICULTIES) as Array<Exclude<GameConfig['name'], 'Custom'>>).map((diff) => {
          if (diff === 'Impossible' && !isImpossibleUnlocked) return null;
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
              : `Red Paint Bucket: Flag all adjacent mines. (${paintBucketsRemaining} remaining)`
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
          <span>Red Paint ({paintBucketsRemaining})</span>
        </button>

        {/* Blue Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn blue-paint ${activePaintMode === 'blue' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'blue' ? 'none' : 'blue')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || bluePaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Blue Paint Bucket: Click a tile to start the game before using this tool"
              : bluePaintBucketsRemaining <= 0
              ? "Blue Paint Bucket: No uses remaining"
              : `Blue Paint Bucket: Reveal adjacent 1s. (${bluePaintBucketsRemaining} remaining)`
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
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={bluePaintBucketsRemaining <= 0 ? "#475569" : "#3b82f6"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={bluePaintBucketsRemaining <= 0 ? "#475569" : "#3b82f6"} />
          </svg>
          <span>Blue Paint ({bluePaintBucketsRemaining})</span>
        </button>

        {/* Green Paint Bucket */}
        <button
          className={`tool-btn paint-bucket-btn green-paint ${activePaintMode === 'green' ? 'active' : ''}`}
          onClick={() => setActivePaintMode(activePaintMode === 'green' ? 'none' : 'green')}
          disabled={gameState === 'idle' || gameState === 'won' || gameState === 'lost' || greenPaintBucketsRemaining <= 0}
          title={
            gameState === 'idle'
              ? "Green Paint Bucket: Click a tile to start the game before using this tool"
              : greenPaintBucketsRemaining <= 0
              ? "Green Paint Bucket: No uses remaining"
              : `Green Paint Bucket: Reveal adjacent 2s. (${greenPaintBucketsRemaining} remaining)`
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
            <path d="M6 9h12l-1.5 11h-9L6 9z" fill={greenPaintBucketsRemaining <= 0 ? "#475569" : "#22c55e"} />
            <path d="M10 9v4a2 2 0 0 0 4 0V9" fill={greenPaintBucketsRemaining <= 0 ? "#475569" : "#22c55e"} />
          </svg>
          <span>Green Paint ({greenPaintBucketsRemaining})</span>
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
        💡 <span>Left-Click</span> to reveal tiles. <span>Right-Click</span> to place flags.<br />
        <span>Double-Click</span> or <span>Middle-Click</span> a revealed number to Chord.<br />
        🔴 <span>Red Paint</span> flags adjacent mines. 🔵 <span>Blue Paint</span> reveals adjacent 1s. 🟢 <span>Green Paint</span> reveals adjacent 2s (none reveals/flags the clicked tile itself).
      </div>
    </div>
  );
};
