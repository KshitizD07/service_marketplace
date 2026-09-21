/**
 * @file Avatar.jsx
 * @description Circular monogram avatar with dynamic background color.
 */

import React from 'react';

export default function Avatar({ name = "U", size = 42, color = "#1F6E5E" }) {
  const initials = String(name)
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#E4EEE9',
        color: color,
        border: `1.5px solid ${color}`,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 800,
        fontSize: Math.max(12, Math.floor(size * 0.38)),
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
}
