// Kronos v2 Canonical Design Tokens
export const colors = {
  bgBase: '#171311',
  bgSurface: '#211A15',
  bgElevated: '#2A211B',
  borderSubtle: '#3B2E25',
  borderDefault: '#4C3D31',
  textPrimary: '#F4F1EA',
  textSecondary: '#B7AEA5',
  textMuted: '#8D837A',
  goldAccent: '#C89F3D',
  goldHover: '#D7B04B',
  success: '#4BAF7A',
  warning: '#C98A39',
  danger: '#C45D5D',
};

export const typography = {
  fontDisplay: "'Outfit', 'Inter', system-ui, sans-serif",
  fontSans: "'Inter', system-ui, sans-serif",
  titlePage: '2.5rem',
  titleSection: '1.85rem',
  titleCard: '1.25rem',
  body: '0.95rem',
  caption: '0.8rem',
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '0.75rem', // 12px
  lg: '1rem',    // 16px
  xl: '1.5rem',   // 24px
  xxl: '2rem',   // 32px
  xxxl: '3rem',  // 48px
};

export const geometry = {
  radiusBadge: '4px',
  radiusInteractive: '6px',
  radiusCard: '8px',
  borderWidth: '1px',
};

const designTokens = { colors, typography, spacing, geometry };
export default designTokens;

