/**
 * @file StatusPill.jsx
 * @description Color-coded badge representing appointment status.
 */

import React from 'react';

const STATUS_CONFIG = {
  Requested: { bg: '#F5E4D9', text: '#8A481F', label: 'Requested' },
  Confirmed: { bg: '#E4EEE9', text: '#154E43', label: 'Confirmed' },
  'In Progress': { bg: '#EBE7F4', text: '#4A3E73', label: 'In Progress' },
  Completed: { bg: '#E4EEE9', text: '#154E43', label: 'Completed' },
  Cancelled: { bg: '#F3E1DA', text: '#A6432B', label: 'Cancelled' },
};

export default function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || {
    bg: '#EDE8DA',
    text: '#8D8577',
    label: status || 'Unknown'
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: '0.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: config.bg,
        color: config.text,
        whiteSpace: 'nowrap'
      }}
    >
      {config.label}
    </span>
  );
}
