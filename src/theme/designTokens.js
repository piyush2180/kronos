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
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  xxl: '2rem',
  xxxl: '3rem',
};

const designTokens = { colors, typography, spacing };
export default designTokens;
