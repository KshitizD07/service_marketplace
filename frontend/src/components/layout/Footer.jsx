/**
 * @file Footer.jsx
 * @description Standard platform footer with brand summary and copyright notes.
 */

import React from 'react';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #E1DACB',
        background: '#EDE8DA',
        padding: '3rem 1.5rem 2rem',
        marginTop: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              background: '#1F6E5E',
              color: '#FBFAF6',
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Briefcase size={16} />
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1F1C' }}>
              Service Marketplace
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8D8577' }}>
              Trusted home & professional services with verified reviews.
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#8D8577' }}>
          &copy; {new Date().getFullYear()} Service Marketplace Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
