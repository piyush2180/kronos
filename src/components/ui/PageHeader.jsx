import React from 'react';
import { colors, spacing, typography } from '../../theme/designTokens';

export default function PageHeader({ title, subtitle, actions, category, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: `1px solid ${colors.borderSubtle}`,
        paddingBottom: spacing.lg,
        marginBottom: spacing.xl,
        width: '100%',
        ...style,
      }}
    >
      <div>
        {category && (
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: colors.textMuted, textTransform: 'capitalize' }}>
            {category}
          </span>
        )}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary, margin: '0.1rem 0 0 0', lineHeight: 1.2 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0.25rem 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
