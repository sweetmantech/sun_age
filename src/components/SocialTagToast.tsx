import React from 'react';

export function SocialTagToast({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        background: '#faf3df',
        border: '2px solid #e5dfc7',
        borderRadius: 0,
        padding: '18px 24px 18px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        position: 'relative',
        fontFamily: 'GT Alpina, serif',
        minWidth: 320,
        maxWidth: 420,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 20, color: '#222', marginBottom: 4 }}>
          POSTING TO SOCIAL?
        </div>
        <div style={{ fontSize: 36, fontWeight: 400, color: '#222', lineHeight: 1.1 }}>
          Tag us, we're <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>@solaracosmos</span>!
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          fontSize: 32,
          lineHeight: 1,
          color: '#222',
          cursor: 'pointer',
          position: 'absolute',
          top: 16,
          right: 16,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
} 