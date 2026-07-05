import React from 'react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function SecondaryButton({ children, onClick, style = {}, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        color: colors.textPrimary,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        height: '48px',
        borderRadius: geometry.radiusInteractive,
        padding: '0 24px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
