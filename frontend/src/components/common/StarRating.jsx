/**
 * @file StarRating.jsx
 * @description Star rating renderer with interactive selection or read-only display.
 */

import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 15,
  showNumber = true,
  onChange = null
}) {
  const isInteractive = typeof onChange === 'function';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <Star
            key={starValue}
            size={size}
            color="#B8912B"
            fill={isFilled ? "#B8912B" : "transparent"}
            onClick={() => isInteractive && onChange(starValue)}
            style={{
              cursor: isInteractive ? 'pointer' : 'default',
              transition: 'transform 0.1s ease'
            }}
          />
        );
      })}
      {showNumber && (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: 4, color: '#1B1F1C' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
