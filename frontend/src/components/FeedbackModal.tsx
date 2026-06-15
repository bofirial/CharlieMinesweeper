import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5045' : '';

interface FeedbackItem {
  id: string;
  name: string;
  type: 'bug' | 'feature' | 'praise' | 'other';
  rating: number;
  content: string;
  timestamp: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<FeedbackItem['type']>('praise');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedbacks`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        setError("Failed to load feedbacks.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchFeedbacks();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const newItem = {
      name: name.trim() || 'Anonymous User',
      type,
      rating,
      content: content.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setSubmitted(true);
        setName('');
        setType('praise');
        setRating(5);
        setContent('');
        fetchFeedbacks();

        setTimeout(() => {
          setSubmitted(false);
        }, 2500);
      } else {
        setError("Failed to submit feedback.");
      }
    } catch {
      setError("Could not submit feedback. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmojiForType = (t: FeedbackItem['type']) => {
    switch (t) {
      case 'bug': return '🐛';
      case 'feature': return '💡';
      case 'praise': return '❤️';
      case 'other':
      default:
        return '💬';
    }
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">Share Your Feedback</h2>
        <p className="modal-subtitle">Tell us what you think about the new colors and paints!</p>

        {submitted ? (
          <div className="feedback-success-container">
            <div className="success-checkmark">🎉</div>
            <h3>Thank You!</h3>
            <p>Your feedback has been saved and shared with the board.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {error && (
              <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                ⚠️ {error}
              </div>
            )}
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous Board Raider"
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="category-selector">
                {(['praise', 'feature', 'bug', 'other'] as FeedbackItem['type'][]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-btn ${type === cat ? 'active' : ''} ${cat}`}
                    onClick={() => setType(cat)}
                  >
                    <span className="cat-emoji">{getEmojiForType(cat)}</span>
                    <span className="cat-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star-icon ${(hoverRating !== null ? hoverRating >= star : rating >= star) ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you think of Teal and Magenta paints? Any suggestions?"
                rows={3}
                required
                maxLength={500}
              />
            </div>

            <button type="submit" className="feedback-submit-btn" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        )}

        <div className="feedback-list-divider" />

        <div className="recent-feedbacks-section">
          <h3>Community Feedbacks</h3>
          <div className="feedback-scroll-list">
            {loading ? (
              <div className="empty-feedback">Loading feedbacks...</div>
            ) : feedbacks.length === 0 ? (
              <div className="empty-feedback">No feedback submitted yet. Be the first!</div>
            ) : (
              feedbacks.map((item) => (
                <div key={item.id} className="feedback-card-item">
                  <div className="feedback-card-header">
                    <span className="feedback-card-name">{item.name}</span>
                    <span className="feedback-card-date">{formatDate(item.timestamp)}</span>
                  </div>
                  <div className="feedback-card-meta">
                    <span className={`feedback-badge ${item.type}`}>
                      {getEmojiForType(item.type)} {item.type.toUpperCase()}
                    </span>
                    <span className="feedback-card-stars">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </span>
                  </div>
                  <p className="feedback-card-content">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
