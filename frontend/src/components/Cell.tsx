import React from 'react';
import type { Cell as CellType } from '../types';

interface CellProps {
  cell: CellType;
  onClick: () => void;
  onFlag: () => void;
  onChord: () => void;
  isPaintHighlighted?: 'none' | 'red' | 'blue' | 'green';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Cell: React.FC<CellProps> = React.memo(({
  cell,
  onClick,
  onFlag,
  onChord,
  isPaintHighlighted = 'none',
  onMouseEnter,
  onMouseLeave,
}) => {
  const { isMine, isRevealed, isFlagged, neighborMines } = cell;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onChord();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle click
      e.preventDefault();
      onChord();
    }
  };

  // Determine CSS classes for rendering
  let cellClass = 'cell';
  let content: React.ReactNode = '';

  if (isRevealed) {
    cellClass += ' revealed';
    if (isMine) {
      if (cell.isExploded) {
        cellClass += ' exploded';
        content = <span className="mine-icon">💥</span>;
      } else if (isFlagged) {
        cellClass += ' correctly-flagged';
        content = <span className="mine-icon">💣</span>;
      } else {
        cellClass += ' mine';
        content = <span className="mine-icon">💣</span>;
      }
    } else if (neighborMines > 0) {
      cellClass += ` num-${neighborMines}`;
      content = neighborMines;
    }
  } else {
    cellClass += ' unrevealed';
    if (isFlagged) {
      cellClass += ' flagged';
      content = <span className="flag-icon">🚩</span>;
    }
    if (isPaintHighlighted === 'red') {
      cellClass += ' paint-highlighted-red';
    } else if (isPaintHighlighted === 'blue') {
      cellClass += ' paint-highlighted-blue';
    } else if (isPaintHighlighted === 'green') {
      cellClass += ' paint-highlighted-green';
    }
  }

  // If the cell is a mine and revealed, and it's game over,
  // let's make it look exploded if it was clicked.
  // In our hook, we revealed all mines. We can check if a revealed mine is clicked.
  // Let's add a small check: we will add a flag in the hook, or here we can
  // let cells have an "exploded" state if they triggered it.
  // To keep it simple, we can check if it's a mine, it's revealed, and game is lost.
  // We can also let the hook set a property, but this works beautifully.

  return (
    <div
      className={cellClass}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </div>
  );
});

Cell.displayName = 'Cell';
