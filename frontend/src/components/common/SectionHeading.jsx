/**
 * @file SectionHeading.jsx
 * @description Standardized section header with eyebrow, title, and descriptive subtitle.
 */

import React from 'react';

export default function SectionHeading({ eyebrow, title, sub, align = 'left' }) {
  return (
    <div style={{ marginBottom: '1.8rem', textAlign: align }}>
      {eyebrow && (
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#1F6E5E',
            marginBottom: 6
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
          fontWeight: 600,
          color: '#1B1F1C',
          margin: 0,
          lineHeight: 1.2
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ color: '#8D8577', fontSize: '0.95rem', margin: '6px 0 0', lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
