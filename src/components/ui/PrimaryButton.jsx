import React from 'react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function PrimaryButton({ children, onClick, style = {}, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
      style={{
        backgroundColor: colors.goldAccent,
        color: colors.bgBase,
        border: 'none',
        height: '48px',
        borderRadius: geometry.radiusInteractive,
        padding: '0 24px',
        fontSize: '14px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
