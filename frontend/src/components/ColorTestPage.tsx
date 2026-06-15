import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5045' : '';
import { Cell } from './Cell';
import { DIFFICULTIES, type Cell as CellType, type HighScoreEntry } from '../types';

interface FeedbackItem {
  id: string;
  name: string;
  type: 'bug' | 'feature' | 'praise' | 'other';
  rating: number;
  content: string;
  timestamp: string;
}



export const ColorTestPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [highScores, setHighScores] = useState<Record<string, HighScoreEntry[]>>({});

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedbacks`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error("Error fetching feedbacks:", e);
    }
  };

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
      fetchFeedbacks();
      fetchHighScores();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Error deleting feedback:", e);
    }
  };

  // Construct a mock board to showcase all numbers (1-8), mines, flags, and states
  const mockBoard: CellType[][] = [
    // Row 0: Numbers 1 to 8 and an exploded mine
    [
      { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 1 },
      { row: 0, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
      { row: 0, col: 2, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 3 },
      { row: 0, col: 3, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 4 },
      { row: 0, col: 4, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 5 },
      { row: 0, col: 5, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 6 },
      { row: 0, col: 6, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 7 },
      { row: 0, col: 7, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 8 },
      { row: 0, col: 8, isMine: true, isRevealed: true, isFlagged: false, neighborMines: 0, isExploded: true },
    ],
    // Row 1: Flagged, unrevealed, standard mine, and various neighboring tiles
    [
      { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 2, isMine: true, isRevealed: true, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 3, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 4, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 5, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 6, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 7, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 1, col: 8, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
    ],
    // Row 2: Standard unrevealed layout
    [
      { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 3, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 4, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 5, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 6, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 7, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      { row: 2, col: 8, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
    ]
  ];

  const goBack = () => {
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const paletteColors = [
    { label: 'Number 1', hex: '#60a5fa', desc: 'Blue' },
    { label: 'Number 2', hex: '#34d399', desc: 'Emerald' },
    { label: 'Number 3', hex: '#fb7185', desc: 'Coral' },
    { label: 'Number 4', hex: '#c084fc', desc: 'Purple' },
    { label: 'Number 5', hex: '#f97316', desc: 'Orange' },
    { label: 'Number 6', hex: '#ffffff', desc: 'White' },
    { label: 'Number 7', hex: '#b45309', desc: 'Brown' },
    { label: 'Number 8', hex: 'linear-gradient(135deg, #60a5fa, #34d399, #fb7185, #c084fc, #f97316, #ffffff, #b45309, #f472b6)', desc: 'Rainbow', isRainbow: true },
    { label: 'Mine', hex: '#f43f5e', desc: 'Rose (Explosion)' },
    { label: 'Flag', hex: '#ef4444', desc: 'Red' },
  ];

  return (
    <div className="app-container color-test-container">
      <div className="title-container">
        <h1 className="app-title">Color Verification</h1>
        <div className="app-subtitle" style={{ color: '#ef4444', fontWeight: 'bold' }}>
          ⚠️ LOCAL DEVELOPMENT ONLY
        </div>
      </div>

      <div className="tools-container">
        <button className="tool-btn" onClick={goBack}>
          ← Back to Game
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        {/* Mock Cabinet */}
        <div className="game-cabinet playing">
          <div className="game-header">
            <div className="display-panel" title="Mines Remaining">
              <div className="display-value">009</div>
            </div>
            <button className="face-button" title="Test Board" disabled>
              <span className="face-emoji">🧐</span>
            </button>
            <div className="display-panel" title="Time Elapsed">
              <div className="display-value">042</div>
            </div>
          </div>

          <div className="board-grid-wrapper">
            <div
              className="board-grid"
              style={{
                gridTemplateColumns: 'repeat(9, 32px)',
              }}
            >
              {mockBoard.map((row) =>
                row.map((cell) => (
                  <Cell
                    key={`test-${cell.row}-${cell.col}`}
                    cell={cell}
                    onClick={() => {}}
                    onFlag={() => {}}
                    onChord={() => {}}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Color Palette Cards */}
        <div 
          className="game-cabinet" 
          style={{ 
            minWidth: '300px', 
            alignItems: 'stretch', 
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.85)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontSize: '1.2rem', color: '#a5b4fc' }}>
            Palette Guide
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {paletteColors.map((color) => (
              <div 
                key={color.label} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '4px', 
                      background: color.hex,
                      boxShadow: color.isRainbow ? '0 0 8px rgba(255, 255, 255, 0.5)' : `0 0 8px ${color.hex}`
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{color.label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#64748b' }}>
                  {color.isRainbow ? 'Rainbow' : color.hex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Settings Guide */}
        <div 
          className="game-cabinet" 
          style={{ 
            minWidth: '350px', 
            alignItems: 'stretch', 
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.85)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontSize: '1.2rem', color: '#a5b4fc' }}>
            Difficulty Settings Guide
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.values(DIFFICULTIES).map((diff) => (
              <div 
                key={diff.name} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{diff.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(99, 102, 241, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                    💣 {diff.mines} Mines
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>Size: {diff.rows} × {diff.cols} ({diff.rows * diff.cols} squares)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#fbbf24', marginTop: '0.1rem' }}>
                  <span>Best Record:</span>
                  <span style={{ fontWeight: 600 }}>
                    {highScores[diff.name] && highScores[diff.name].length > 0 
                      ? `${highScores[diff.name][0].time}s (${highScores[diff.name][0].playerName})`
                      : '---'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  <span style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    🔴 Red: {diff.redPaintBuckets === Infinity ? '∞' : diff.redPaintBuckets}
                  </span>
                  <span style={{ color: '#14b8a6', background: 'rgba(20, 184, 166, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    🌀 Teal: {diff.tealPaintBuckets === Infinity ? '∞' : diff.tealPaintBuckets}
                  </span>
                  <span style={{ color: '#d946ef', background: 'rgba(217, 70, 239, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    🟣 Magenta: {diff.magentaPaintBuckets === Infinity ? '∞' : diff.magentaPaintBuckets}
                  </span>
                  <span style={{ color: '#d2b48c', background: 'rgba(210, 180, 140, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    🟫 Tan: {diff.tanPaintBuckets === Infinity ? '∞' : diff.tanPaintBuckets}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted Feedbacks Card */}
        <div 
          className="game-cabinet" 
          style={{ 
            minWidth: '350px', 
            flex: '1 1 350px',
            alignItems: 'stretch', 
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.85)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontSize: '1.2rem', color: '#a5b4fc' }}>
            Submitted Feedbacks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '1.5rem' }}>
                No feedback submitted yet.
              </div>
            ) : (
              feedbacks.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</span>
                    <button 
                      onClick={() => handleDeleteFeedback(item.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background 0.2s, border-color 0.2s'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: item.type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : item.type === 'feature' ? 'rgba(59, 130, 246, 0.15)' : item.type === 'praise' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: item.type === 'bug' ? '#f87171' : item.type === 'feature' ? '#60a5fa' : item.type === 'praise' ? '#4ade80' : '#cbd5e1',
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {item.type.toUpperCase()}
                    </span>
                    <span style={{ color: '#fbbf24' }}>
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
