export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

export const safeArea = {
  top: '1rem',           // 16px - top safe area
  bottom: '1.5rem',      // 24px - bottom safe area for mobile home indicator
  bottomMd: '1.25rem',   // 20px - bottom safe area for tablets
  sides: '1rem',         // 16px - horizontal padding
  sidesSm: '1.5rem',     // 24px - horizontal padding on larger screens
} as const;

export const containerWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
} as const;

export const contentPadding = {
  x: 'px-4',           // Horizontal padding
  xMd: 'md:px-6',      // Horizontal padding on medium screens
  y: 'py-4',           // Vertical padding
  yMd: 'md:py-6',      // Vertical padding on medium screens
} as const;
