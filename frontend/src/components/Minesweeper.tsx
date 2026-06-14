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
  } = useMinesweeper();

  const [isGridMouseDown, setIsGridMouseDown] = useState(false);

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
    resetGame(DIFFICULTIES[difficulty]);
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
            onClick={() => resetGame()}
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
            className="board-grid"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 32px)`,
            }}
            onMouseDown={() => setIsGridMouseDown(true)}
            onMouseUp={() => setIsGridMouseDown(false)}
            onMouseLeave={() => setIsGridMouseDown(false)}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onFlag={() => toggleFlag(rowIndex, colIndex)}
                  onChord={() => chordCell(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="game-instructions">
        💡 <span>Left-Click</span> to reveal tiles. <span>Right-Click</span> to place flags.<br />
        <span>Double-Click</span> or <span>Middle-Click</span> a revealed number to Chord (reveal surrounding tiles when flags match).
      </div>
    </div>
  );
};
