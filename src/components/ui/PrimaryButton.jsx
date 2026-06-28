import React from 'react';
import { colors } from '../../theme/designTokens';

export default function PrimaryButton({ children, onClick, style = {}, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
      style={{
        backgroundColor: colors.goldAccent,
        color: '#15100c',
        border: 'none',
        borderRadius: '5px',
        padding: '0.55rem 1rem',
        fontSize: '0.825rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.18s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
