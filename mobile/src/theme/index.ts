export const colors = {
  dark: {
    background: '#050E1B',
    surface: '#0D1B33',
    surfaceAlt: '#102243',
    card: 'rgba(8, 22, 47, 0.95)',
    text: '#F8FAFC',
    textSecondary: '#A8B8D4',
    accent: '#2CE5D5',
    accentStrong: '#30FFE8',
    accentMuted: 'rgba(46, 229, 213, 0.16)',
    border: 'rgba(255,255,255,0.12)',
    shadow: 'rgba(0,0,0,0.35)',
    success: '#3BFFB1',
    warning: '#FFD569',
    error: '#FF5B7F',
    graphStart: '#08A39A',
    graphEnd: '#0F8EA8',
  },
  light: {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F6FB',
    card: '#FFFFFF',
    text: '#101828',
    textSecondary: '#475569',
    accent: '#0A9396',
    accentStrong: '#0F9DAB',
    accentMuted: 'rgba(10,147,150,0.14)',
    border: 'rgba(14, 165, 233, 0.12)',
    shadow: 'rgba(15, 23, 42, 0.12)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    graphStart: '#22C55E',
    graphEnd: '#0EA5E9',
  },
};

export const gradients = {
  glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'] as const,
  accent: ['#2CE5D5', '#1AC6F5'] as const,
  navy: ['#071B2F', '#0B1F3A'] as const,
  waves: ['rgba(46,229,213,0.18)', 'rgba(7,65,107,0.12)'] as const,
  card: ['rgba(8, 22, 47, 0.9)', 'rgba(18, 37, 72, 0.85)'] as const,
  glow: ['rgba(46,229,213,0.28)', 'rgba(31, 46, 88, 0.18)'] as const,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
};

export const borderRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
};

export const typography = {
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  caption: 12,
};
