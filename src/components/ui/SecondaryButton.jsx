import React from 'react';
import { colors } from '../../theme/designTokens';

export default function SecondaryButton({ children, onClick, style = {}, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary ${className}`}
      style={{
        backgroundColor: colors.bgSurface,
        color: colors.textPrimary,
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: '5px',
        padding: '0.55rem 1rem',
        fontSize: '0.825rem',
        fontWeight: 500,
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
