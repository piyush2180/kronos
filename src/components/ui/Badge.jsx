import React from 'react';
import { colors, spacing, geometry } from '../../theme/designTokens';

export default function Badge({ children, variant = 'info', style = {} }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(75, 175, 122, 0.1)',
          color: colors.success,
          border: '1px solid rgba(75, 175, 122, 0.25)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(201, 138, 57, 0.1)',
          color: colors.warning,
          border: '1px solid rgba(201, 138, 57, 0.25)',
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(196, 93, 93, 0.1)',
          color: colors.danger,
          border: '1px solid rgba(196, 93, 93, 0.25)',
        };
      case 'gold':
        return {
          backgroundColor: 'rgba(200, 159, 61, 0.1)',
          color: colors.goldAccent,
          border: '1px solid rgba(200, 159, 61, 0.25)',
        };
      case 'info':
      default:
        return {
          backgroundColor: 'rgba(141, 131, 122, 0.1)',
          color: colors.textSecondary,
          border: '1px solid rgba(141, 131, 122, 0.25)',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: geometry.radiusBadge,
        fontSize: '0.7rem',
        fontWeight: 600,
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
}
