import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  interactive = false,
  onChange,
  size = 16,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating !== null ? hoverRating : rating;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      stars.push(
        interactive ? (
          <button
            key={i}
            type="button"
            className={`star-btn ${isFilled ? 'active' : ''}`}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            style={{ width: size + 8, height: size + 8 }}
          >
            <Star
              className="star-interactive-icon"
              style={{
                width: size,
                height: size,
                fill: isFilled ? 'currentColor' : 'none',
              }}
            />
          </button>
        ) : (
          <Star
            key={i}
            className={`star ${isFilled ? '' : 'star-empty'}`}
            style={{
              width: size,
              height: size,
              fill: isFilled ? 'currentColor' : 'none',
            }}
          />
        )
      );
    }

    return stars;
  };

  return (
    <div className="rating-interactive">
      <div className="stars">{renderStars()}</div>
      {count !== undefined && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ({count} rating{count !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};
