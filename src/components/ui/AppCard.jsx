import React from 'react';
import { colors } from '../../theme/designTokens';

export default function AppCard({ children, variant = 'primary', style = {}, className = '', onClick }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: '6px',
          padding: '1rem',
        };
      case 'flat':
        return {
          backgroundColor: colors.bgBase,
          border: '1px solid transparent',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: '8px',
          padding: '1.25rem',
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
