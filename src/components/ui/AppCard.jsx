import React from 'react';
import { colors, spacing, geometry } from '../../theme/designTokens';

export default function AppCard({ children, variant = 'primary', style = {}, className = '', onClick }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: geometry.radiusCard,
          padding: spacing.lg,
        };
      case 'flat':
        return {
          backgroundColor: colors.bgBase,
          border: '1px solid transparent',
          borderRadius: geometry.radiusCard,
          padding: `${spacing.md} ${spacing.lg}`,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: geometry.radiusCard,
          padding: spacing.xl,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        };
    }
  };

  return (
    <div
      onClick={onClick}
      className={`app-card ${className}`}
      style={{
        ...getVariantStyles(),
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
