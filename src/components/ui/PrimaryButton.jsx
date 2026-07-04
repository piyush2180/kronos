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
        borderRadius: geometry.radiusInteractive,
        padding: `${spacing.sm} ${spacing.lg}`,
        fontSize: typography.caption,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.18s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
