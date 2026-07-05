import React from 'react';
import { colors, spacing, geometry } from '../../theme/designTokens';

export default function AppCard({ children, variant = 'primary', style = {}, className = '', onClick }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'rgba(33, 26, 21, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          borderRadius: geometry.radiusCard,
          padding: spacing.lg,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
        };
      case 'flat':
        return {
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          borderRadius: geometry.radiusCard,
          padding: `${spacing.md} ${spacing.lg}`,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.bgSurface,
          border: '1px solid rgba(255, 255, 255, 0.03)',
          borderRadius: geometry.radiusCard,
          padding: spacing.xl,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
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
